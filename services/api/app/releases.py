from sqlalchemy import select
from .db import uid
from .models import Release, Member, Version, Evidence, Active, Audit, Node
from .config import settings
from .seed import COVERED


def validate_release(db,release):
    versions=list(db.scalars(select(Version).join(Member,Version.id==Member.version_id).where(Member.release_id==release.id)))
    errors=[]
    for node in COVERED:
        for tier in (1,2,3):
            if sum(v.node_id==node and v.tier==tier for v in versions)<4:
                errors.append(f'Missing coverage: {node} L{tier} (minimum 4)')
    for v in versions:
        evidence=db.scalar(select(Evidence).where(Evidence.version_id==v.id).order_by(Evidence.created.desc()))
        r=evidence.report if evidence else {}
        if v.state!='approved' or not r.get('approved') or r.get('deterministic',{}).get('status')!='verified' or r.get('schema')!='verified' or r.get('blind',{}).get('answer')!=v.content['answer'] or r.get('review',{}).get('status')!='accepted':
            errors.append(f'Missing or failed evidence: {v.id}')
        if settings.environment=='production' and r.get('mock',True):
            errors.append('Mock evidence prohibited in production')
    release.report={'valid':not errors,'errors':errors,'questions':len(versions),'coverage_policy':'development-six-nodes-L1-L3-v1','uncovered_nodes':list(db.scalars(select(Node.id).where(Node.id.not_in(COVERED)))),'uncovered_tiers':[4,5]}
    release.state='validated' if not errors else 'failed'
    return release.report


def activate(db,release_id,actor,reason):
    # The singleton pointer row serializes switches on PostgreSQL.
    active=db.scalar(select(Active).where(Active.id==1).with_for_update())
    release=db.get(Release,release_id)
    if not release: raise ValueError('Release not found')
    report=validate_release(db,release)
    if not report['valid']: raise ValueError('Release failed validation')
    old=active.release_id
    active.release_id=release.id
    db.add(Audit(actor=actor,action='release.switch',detail={'from':old,'to':release.id,'reason':reason}))
    return {'previous':old,'active':release.id}
