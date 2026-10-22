from datetime import timedelta
from sqlalchemy import select, func, update
from .db import now
from .models import Mastery, Attempt, Node, Version, Member, Item, Review, Edge, Assessment, User


FEEDBACK_DELAY_SECONDS = 600


def feedback_available(session, attempt):
    return now() >= attempt.created + timedelta(seconds=FEEDBACK_DELAY_SECONDS) and (session.mode == 'practice' or session.status == 'completed')


def synchronize_feedback(db, user):
    """Materialize only disclosed evidence; no analytics or review-schedule side channel."""
    # A no-op row update is a cross-dialect write lock. Parallel dashboard/graph/
    # analytics requests must not materialize the same attempt twice.
    db.execute(update(User).where(User.id==user.id).values(name=User.name))
    query=select(Attempt, Assessment).join(Item, Item.id==Attempt.item_id).join(Assessment,Assessment.id==Item.session_id).where(Attempt.user_id==user.id).order_by(Attempt.created,Attempt.id)
    for attempt, session in db.execute(query):
        if feedback_available(session, attempt) and not db.scalar(select(Mastery.id).where(Mastery.attempt_id==attempt.id)):
            update_mastery(db,user,db.get(Version,attempt.version_id),attempt)
            db.flush()


def latest_mastery(db,user_id,node_id):
    return db.scalar(select(Mastery).where(Mastery.user_id==user_id,Mastery.node_id==node_id).order_by(Mastery.created.desc(),Mastery.id.desc()))


def overlays(db,user_id):
    out=[]
    for node in db.scalars(select(Node).order_by(Node.id)):
        m=latest_mastery(db,user_id,node.id)
        a,b,n=(m.alpha,m.beta,m.observations) if m else (1,1,0)
        estimate=a/(a+b)
        # Uncertainty penalty is not a calibrated confidence interval.
        uncertainty=1/(n+1)**0.5
        priority=(1-estimate)*0.6+uncertainty*0.4
        out.append({'id':node.id,'name':node.name,'subject':node.subject,'description':node.description,'domain':node.domain,'estimate':round(estimate,3) if n else None,'observations':n,'uncertainty':round(uncertainty,3),'priority':round(priority,3),'state':'insufficient evidence' if n<4 else 'developing' if estimate<0.75 else 'strengthening','reason':f'{n} independent observations; '+('more diagnostic evidence needed' if n<4 else 'practice weighted by uncertainty and observed errors')})
    return out


def update_mastery(db,user,version,attempt):
    previous=latest_mastery(db,user.id,version.node_id)
    a,b,n=(previous.alpha,previous.beta,previous.observations) if previous else (1,1,0)
    # Repeat exposure and hints do not count as independent mastery evidence.
    if attempt.first and not attempt.hint:
        a+=int(attempt.correct)
        b+=int(not attempt.correct)
        n+=1
    db.add(Mastery(user_id=user.id,node_id=version.node_id,alpha=a,beta=b,observations=n,attempt_id=attempt.id))
    review=db.get(Review,(user.id,version.node_id))
    days=3 if attempt.correct else 1
    if review:
        review.due=now()+timedelta(days=days)
        review.interval_days=days
    else:
        db.add(Review(user_id=user.id,node_id=version.node_id,due=now()+timedelta(days=days),interval_days=days))


def next_item(db,session):
    used=list(db.scalars(select(Item.version_id).where(Item.session_id==session.id)))
    candidates=list(db.scalars(select(Version).join(Member,Member.version_id==Version.id).where(Member.release_id==session.release_id,Version.node_id.like(session.subject+'.%'),Version.state=='approved')))
    candidates=[v for v in candidates if v.id not in used and (not session.node_id or v.node_id==session.node_id)]
    if not candidates:
        session.status='completed'
        return None
    priorities={o['id']:o['priority'] for o in overlays(db,session.user_id)}
    # Every fourth question explores a covered node, avoiding an endless remedial trap.
    explore=len(used)%4==3
    candidates.sort(key=lambda v:(abs(v.tier-session.tier), 0 if explore else -priorities[v.node_id], v.id))
    version=candidates[0]
    item=Item(session_id=session.id,version_id=version.id,position=len(used)+1)
    db.add(item)
    db.flush()
    return item


def adapt(session,correct):
    session.streak=(max(0,session.streak)+1) if correct else (min(0,session.streak)-1)
    if abs(session.streak)>=2:
        session.tier=max(1,min(5,session.tier+(1 if correct else -1)))
        session.streak=0


def analytics(db,user_id,subject=None,node=None,tier=None,start=None,end=None):
    query=select(Attempt,Version).join(Version,Version.id==Attempt.version_id).join(Item,Item.id==Attempt.item_id).join(Assessment,Assessment.id==Item.session_id).where(Attempt.user_id==user_id,Attempt.created<=now()-timedelta(seconds=FEEDBACK_DELAY_SECONDS)).where((Assessment.mode=='practice') | (Assessment.status=='completed'))
    if subject: query=query.where(Version.node_id.like(subject+'.%'))
    if node: query=query.where(Version.node_id==node)
    if tier: query=query.where(Version.tier==tier)
    if start: query=query.where(Attempt.created>=start)
    if end: query=query.where(Attempt.created<=end)
    rows=list(db.execute(query.order_by(Attempt.created)))
    first=[a for a,v in rows if a.first]
    def rate(items): return round(sum(a.correct for a in items)/len(items),4) if items else None
    distribution={str(t):sum(v.tier==t for a,v in rows) for t in range(1,6)}
    history=[{'date':a.created.isoformat(),'correct':a.correct,'tier':v.tier,'node':v.node_id,'first':a.first} for a,v in rows]
    return {'attempts':len(rows),'first_attempts':len(first),'first_accuracy':rate(first),'overall_accuracy':rate([a for a,v in rows]),'independent':sum(a.first and not a.hint for a,v in rows),'hint_assisted':sum(a.hint for a,v in rows),'repeats':len(rows)-len(first),'seconds':sum(a.seconds for a,v in rows),'difficulty_distribution':distribution,'history':history,'by_subject':{s:{'n':sum(v.node_id.startswith(s+'.') for a,v in rows),'accuracy':rate([a for a,v in rows if v.node_id.startswith(s+'.')])} for s in ('math','physics')},'transfer_accuracy':None,'retention_accuracy':None,'improvement':{'conclusion':'insufficient comparable evidence','reason':'No matched baseline/follow-up or unfamiliar transfer set; parameter variants are not independent transfer evidence.'},'limitations':['Heuristic Beta(1,1) model, not a calibrated psychometric measure.','Provisional fixture difficulty; score changes do not establish learning gains.']}
