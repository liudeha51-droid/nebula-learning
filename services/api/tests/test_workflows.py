from copy import deepcopy
from datetime import timedelta
from unittest.mock import patch
from sqlalchemy import select,func
import pytest
from app.models import Active,Attempt,Version,Mastery,Assessment,Item,Member,Evidence,Release,User,Node
from app.db import now
from app.seed import seed
from app.learning import adapt
from app.config import Settings,settings

P='/api/v1'


def begin(client,mode='practice',subject='math',node=None):
    r=client.post(P+'/assessments',json={'subject':subject,'mode':mode,'node_id':node})
    assert r.status_code==200,r.text
    return r.json()


def submit(client,s,selected='A',**extra):
    item=s['items'][-1]
    return client.post(P+f"/assessments/{s['id']}/items/{item['id']}/answer",json={'selected':selected,'seconds':5,**extra})


def elapsed(db_factory,seconds=601):
    with db_factory.begin() as db:
        for a in db.scalars(select(Attempt)):
            a.created=now()-timedelta(seconds=seconds)


def test_start_draft_and_resume_no_key(client,student):
    s=begin(client,'diagnostic')
    item=s['items'][0]
    assert 'answer' not in item and item['feedback'] is None
    assert 'solution' not in str(item)
    r=client.put(P+f"/assessments/{s['id']}/items/{item['id']}/draft",json={'selected':'B','flagged':True})
    assert r.status_code==200
    restored=client.get(P+f"/assessments/{s['id']}").json()
    assert restored['items'][0]['draft']=='B' and restored['items'][0]['flagged']


def test_delayed_feedback_and_no_analytics_side_channel(client,student,db_factory):
    s=begin(client)
    r=submit(client,s);assert r.status_code==200
    body=r.json();item=body['items'][0]
    assert item['submitted'] and item['feedback'] is None and item['feedback_available_at']
    assert body['feedback_delay_seconds']==600
    assert client.get(P+'/analytics').json()['attempts']==0
    assert client.get(P+'/reviews').json()==[]
    graph=client.get(P+'/graph').json()
    assert all(n['observations']==0 and n['estimate'] is None for n in graph['nodes'])
    # Time travel is test-only; production uses server UTC, never a client timestamp.
    elapsed(db_factory,599)
    assert client.get(P+f"/assessments/{s['id']}").json()['items'][0]['feedback'] is None
    elapsed(db_factory,601)
    revealed=client.get(P+f"/assessments/{s['id']}").json()['items'][0]
    assert revealed['feedback']['answer'] in 'ABCD'
    assert client.get(P+'/analytics').json()['attempts']==1
    assert len(client.get(P+'/reviews').json())==1
    assert sum(n['observations'] for n in client.get(P+'/graph').json()['nodes'])==1
    with db_factory() as db: assert db.scalar(select(func.count()).select_from(Mastery))==1


def test_delay_uses_server_clock_not_client_fields(client,student):
    s=begin(client)
    r=submit(client,s,created='2000-01-01',feedback_available_at='2000-01-01')
    assert r.status_code==422


@pytest.mark.parametrize('mode',['diagnostic','exam'])
def test_completion_and_delay_both_required(client,student,db_factory,mode):
    s=begin(client,mode)
    result=submit(client,s).json()
    elapsed(db_factory)
    assert client.get(P+f"/assessments/{s['id']}").json()['items'][0]['feedback'] is None
    assert client.get(P+'/analytics').json()['attempts']==0
    done=client.post(P+f"/assessments/{s['id']}/complete").json()
    assert done['items'][0]['feedback'] is not None


def test_completing_early_cannot_bypass_delay(client,student):
    s=begin(client,'diagnostic');submit(client,s)
    done=client.post(P+f"/assessments/{s['id']}/complete").json()
    assert done['items'][0]['feedback'] is None
    assert all(n['observations']==0 for n in done['report'])


def test_repeated_submission_idempotent_and_locked(client,student,db_factory):
    s=begin(client);assert submit(client,s).status_code==200
    assert submit(client,s).status_code==200
    assert submit(client,s,'B').status_code==409
    with db_factory() as db: assert db.scalar(select(func.count()).select_from(Attempt))==1


def test_student_isolation(client,student):
    s=begin(client)
    nid='private-note'
    assert client.put(P+'/notes/'+nid,json={'title':'Private','body':'My thoughts','formula':'x^2'}).status_code==200
    client.post(P+'/auth/demo')
    assert client.get(P+f"/assessments/{s['id']}").status_code==404
    assert client.get(P+'/notes').json()==[]
    assert client.put(P+'/notes/'+nid,json={'title':'Intrusion','body':'bad'}).status_code==404
    assert client.post(P+f"/assessments/{s['id']}/complete").status_code==404


@pytest.mark.parametrize('path',['/admin/overview','/admin/questions','/admin/releases'])
def test_student_admin_denied(client,student,path):
    assert client.get(P+path).status_code==403


def test_csrf_and_unsigned_access(client):
    assert client.get(P+'/me').status_code==401
    assert client.post(P+'/auth/demo',headers={'X-Nebula-Client':''}).status_code==403
    assert client.post(P+'/auth/demo',headers={'Sec-Fetch-Site':'cross-site'}).status_code==403


def test_calculator_permissions_and_expiry(client,student,db_factory):
    s=begin(client,'exam')
    assert client.post(P+'/calculate',json={'expression':'1+2','session_id':s['id']}).status_code==403
    assert submit(client,s,calculator_used=True).status_code==403
    with db_factory.begin() as db: db.get(Assessment,s['id']).deadline=now()-timedelta(minutes=1)
    assert submit(client,s).status_code==409


def test_notes_and_profile_persist(client,student):
    assert client.put(P+'/profile',json={'goals':'Understand force','subjects':['physics']}).status_code==200
    assert client.get(P+'/me').json()['profile']['goals']=='Understand force'
    assert client.put(P+'/notes/test-note',json={'title':'Force','body':'Newton law','formula':'F=ma','node_id':'physics.forces'}).status_code==200
    assert client.get(P+'/notes').json()[0]['formula']=='F=ma'
    assert client.put(P+'/profile',json={'grade':-5}).status_code==422


def test_adaptive_rules():
    s=Assessment(tier=2,streak=0)
    adapt(s,True);assert s.tier==2
    adapt(s,True);assert s.tier==3
    adapt(s,False);adapt(s,False);assert s.tier==2
    for _ in range(30): adapt(s,False)
    assert s.tier==1
    for _ in range(30): adapt(s,True)
    assert s.tier==5


def test_seed_idempotent_and_immutability(db_factory):
    with db_factory.begin() as db:
        seed(db)
        assert db.scalar(select(func.count()).select_from(Version))==72
        v=db.scalar(select(Version).limit(1));v.content={**v.content,'answer':'D'}
        with pytest.raises(ValueError): db.flush()


def test_failed_release_atomic_switch_and_rollback(client,administrator,db_factory):
    original=client.get(P+'/admin/overview').json()['active']
    s=begin(client)
    bad=client.post(P+'/admin/releases',json={'copy_active':False}).json()['id']
    report=client.post(P+f'/admin/releases/{bad}/validate').json()
    assert not report['valid'] and report['errors']
    assert client.post(P+f'/admin/releases/{bad}/activate',json={'reason':'Failure simulation'}).status_code==409
    assert client.get(P+'/admin/overview').json()['active']==original
    good=client.post(P+'/admin/releases',json={'copy_active':True}).json()['id']
    assert client.post(P+f'/admin/releases/{good}/validate').json()['valid']
    assert client.post(P+f'/admin/releases/{good}/activate',json={'reason':'Test activation'}).status_code==200
    assert begin(client)['release']==good
    assert client.get(P+f"/assessments/{s['id']}").json()['release']==original
    submit(client,s);elapsed(db_factory)
    before=client.get(P+'/analytics').json()
    assert client.post(P+f'/admin/releases/{original}/activate',json={'reason':'Test rollback'}).status_code==200
    assert client.get(P+'/analytics').json()==before


def test_missing_evidence_blocks_publication(client,administrator,db_factory):
    good=client.post(P+'/admin/releases',json={'copy_active':True}).json()['id']
    with db_factory.begin() as db:
        evidence=db.scalar(select(Evidence).limit(1))
        evidence.report={**evidence.report,'approved':False}
    assert not client.post(P+f'/admin/releases/{good}/validate').json()['valid']
    assert client.post(P+f'/admin/releases/{good}/activate',json={'reason':'Try missing check'}).status_code==409


def test_production_rejects_mock_evidence(client,administrator,monkeypatch):
    good=client.post(P+'/admin/releases',json={'copy_active':True}).json()['id']
    monkeypatch.setattr(settings,'environment','production')
    report=client.post(P+f'/admin/releases/{good}/validate').json()
    assert not report['valid']
    assert 'Mock evidence prohibited in production' in report['errors']
    assert client.post(P+'/auth/demo').status_code==404


def test_revision_preserves_original_and_review_audit(client,administrator):
    original=client.get(P+'/admin/questions').json()[0]
    assert client.post(P+f"/admin/questions/{original['id']}/decision",json={'action':'reject','reason':'Released version must freeze'}).status_code==409
    revision=client.post(P+f"/admin/questions/{original['id']}/revision").json()['id']
    assert client.post(P+f"/admin/questions/{original['id']}/revision").json()['id']==revision
    assert client.post(P+f'/admin/questions/{revision}/decision',json={'action':'quarantine','reason':'Manual inspection pending'}).json()['state']=='quarantined'
    assert next(q for q in client.get(P+'/admin/questions').json() if q['id']==original['id'])['content']==original['content']
    assert client.get(P+'/admin/overview').json()['audit']


def test_recommendation_changes_only_after_reveal(client,student,db_factory):
    initial=client.get(P+'/dashboard').json()['recommendations']
    s=begin(client,node='math.numbers')
    with db_factory() as db: key=db.get(Version,s['items'][0]['version_id']).content['answer']
    submit(client,s,key)
    assert client.get(P+'/dashboard').json()['recommendations']==initial
    elapsed(db_factory)
    after=client.get(P+'/dashboard').json()['recommendations']
    assert after!=initial


def test_configuration_guard():
    with pytest.raises(ValueError): Settings(environment='production',database_url='sqlite:///bad.db')
    with pytest.raises(ValueError): Settings(refresh_days=0)
