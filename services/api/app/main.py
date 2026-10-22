from datetime import datetime, timedelta
from hashlib import sha256
import secrets
from typing import Literal
from fastapi import FastAPI, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.responses import JSONResponse
from argon2 import PasswordHasher
from .config import settings
from .db import database, now, uid
from .models import User, Login, Node, Edge, Active, Assessment, Item, Version, Attempt, Note, Release, Member, Evidence, Audit, Job, Review, Mastery
from .learning import overlays, next_item, update_mastery, adapt, analytics, synchronize_feedback, feedback_available, FEEDBACK_DELAY_SECONDS
from .releases import activate, validate_release
from .calculator import calculate

app=FastAPI(title='Nebula Learning',version='0.1.0',docs_url='/api/docs',openapi_url='/api/openapi.json')
ph=PasswordHasher()
API='/api/v1'


@app.exception_handler(IntegrityError)
async def conflict(request,exc):
    return JSONResponse(status_code=409,content={'detail':'Conflicting update; reload and retry. No duplicate record was committed.'})


@app.middleware('http')
async def safeguards(request: Request, call_next):
    # Browser requests use same-origin cookies; all writes require custom header.
    if request.method in ('POST','PATCH','PUT','DELETE') and request.headers.get('x-nebula-client')!='web':
        return JSONResponse(status_code=403,content={'detail':'Missing same-origin client header'})
    if request.headers.get('sec-fetch-site')=='cross-site':
        return JSONResponse(status_code=403,content={'detail':'Cross-site request rejected'})
    result=await call_next(request)
    result.headers['X-Content-Type-Options']='nosniff'
    result.headers['Cache-Control']='no-store'
    result.headers['X-Frame-Options']='DENY'
    return result


def current(request: Request, db:Session=Depends(database)):
    token=request.cookies.get('nebula_session','')
    login=db.get(Login,sha256(token.encode()).hexdigest()) if token else None
    if not login or login.expires<now(): raise HTTPException(401,'Sign in to continue')
    user=db.get(User,login.user_id)
    if not user: raise HTTPException(401,'Account unavailable')
    return user


def admin(user:User=Depends(current)):
    if user.role!='admin': raise HTTPException(403,'Administrator role required')
    return user


def issue(response,db,user):
    token=secrets.token_urlsafe(40)
    db.add(Login(token_hash=sha256(token.encode()).hexdigest(),user_id=user.id,expires=now()+timedelta(hours=12)))
    response.set_cookie('nebula_session',token,httponly=True,secure=settings.secure_cookies,samesite='strict',max_age=43200,path='/')
    return {'id':user.id,'name':user.name,'role':user.role,'profile':user.profile}


class Strict(BaseModel):
    model_config=ConfigDict(extra='forbid')


class Credentials(Strict):
    email:str=Field(min_length=3,max_length=254,pattern=r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
    password:str=Field(min_length=12,max_length=128)
    name:str=Field(default='Learner',min_length=1,max_length=80)


@app.get(API+'/health')
def health(db:Session=Depends(database)):
    db.execute(select(1))
    return {'status':'ok','environment':settings.environment,'ai':'mock fixtures only' if settings.ai_provider=='mock' else 'not configured','database':db.bind.dialect.name}


@app.post(API+'/auth/register')
def register(body:Credentials,response:Response,db:Session=Depends(database)):
    user=User(email=body.email.lower(),name=body.name,password_hash=ph.hash(body.password),role='student',profile={})
    db.add(user); db.flush()
    return issue(response,db,user)


@app.post(API+'/auth/login')
def login(body:Credentials,response:Response,db:Session=Depends(database)):
    user=db.scalar(select(User).where(User.email==body.email.lower()))
    try:
        if not user or not ph.verify(user.password_hash,body.password): raise ValueError()
    except Exception: raise HTTPException(401,'Invalid email or password')
    return issue(response,db,user)


@app.post(API+'/auth/demo')
def demo(response:Response,db:Session=Depends(database)):
    if settings.environment!='development': raise HTTPException(404)
    # New isolated development learner; not a shared account or admin bypass.
    user=User(email=uid()+'@demo.invalid',name='Explorer',password_hash=ph.hash(secrets.token_urlsafe(30)),profile={'subjects':['math','physics'],'grade':9,'curriculum':'introductory','age_range':'13–15'})
    db.add(user); db.flush()
    return issue(response,db,user)


@app.post(API+'/auth/logout')
def logout(request:Request,response:Response,db:Session=Depends(database)):
    token=request.cookies.get('nebula_session','')
    record=db.get(Login,sha256(token.encode()).hexdigest())
    if record: db.delete(record)
    response.delete_cookie('nebula_session')
    return {'saved':True}


@app.get(API+'/me')
def me(user:User=Depends(current)):
    return {'id':user.id,'name':user.name,'role':user.role,'profile':user.profile}


class Profile(Strict):
    age_range:Literal['under 13','13–15','16–18','19+']='13–15'
    grade:int=Field(default=9,ge=1,le=16)
    curriculum:Literal['introductory','GCSE','AP','IB']='introductory'
    goals:str=Field(default='',max_length=1000)
    subjects:list[Literal['math','physics']]=Field(default=['math','physics'],min_length=1,max_length=2)
    proficiency:Literal['beginner','developing','confident']='developing'
    intensity:Literal['light','balanced','intensive']='balanced'
    reduced_motion:bool=False


@app.put(API+'/profile')
def profile(body:Profile,user:User=Depends(current),db:Session=Depends(database)):
    user.profile=body.model_dump()
    return {'saved':True,'profile':user.profile}


@app.get(API+'/graph')
def graph(subject:Literal['math','physics']|None=None,user:User=Depends(current),db:Session=Depends(database)):
    synchronize_feedback(db,user)
    nodes=overlays(db,user.id)
    if subject: nodes=[n for n in nodes if n['subject']==subject]
    active=db.get(Active,1)
    counts=dict(db.execute(select(Version.node_id,func.count()).join(Member,Member.version_id==Version.id).where(Member.release_id==active.release_id).group_by(Version.node_id)).all())
    for n in nodes: n['coverage']=counts.get(n['id'],0)
    return {'nodes':nodes,'edges':[{'source':e.source,'target':e.target,'kind':e.kind} for e in db.scalars(select(Edge))],'release':active.release_id,'fixture':True}


@app.get(API+'/dashboard')
def dashboard(user:User=Depends(current),db:Session=Depends(database)):
    graph_data=graph(None,user,db)
    return {'analytics':analytics(db,user.id),'recommendations':sorted([n for n in graph_data['nodes'] if n['coverage']],key=lambda n:-n['priority'])[:4],'sessions':[{'id':s.id,'mode':s.mode,'subject':s.subject,'status':s.status,'release':s.release_id} for s in db.scalars(select(Assessment).where(Assessment.user_id==user.id).order_by(Assessment.created.desc()).limit(10))],'release':graph_data['release']}


class Start(Strict):
    subject:Literal['math','physics']='math'
    mode:Literal['practice','diagnostic','exam']='practice'
    node_id:str|None=None


def own_session(db,sid,user,lock=False):
    query=select(Assessment).where(Assessment.id==sid,Assessment.user_id==user.id)
    if lock: query=query.with_for_update()
    s=db.scalar(query)
    if not s: raise HTTPException(404,'Session not found')
    return s


@app.post(API+'/assessments')
def start(body:Start,user:User=Depends(current),db:Session=Depends(database)):
    if body.node_id:
        node=db.get(Node,body.node_id)
        if not node or node.subject!=body.subject: raise HTTPException(422,'Invalid subject/node mapping')
    active=db.get(Active,1)
    if not active: raise HTTPException(503,'No verified active release')
    baseline=1 if user.profile.get('grade',9)<8 else 2
    s=Assessment(user_id=user.id,release_id=active.release_id,subject=body.subject,mode=body.mode,node_id=body.node_id,tier=baseline,calculator=body.mode=='practice',deadline=now()+timedelta(minutes=20) if body.mode=='exam' else None)
    db.add(s); db.flush()
    if not next_item(db,s): raise HTTPException(409,'No verified coverage for this node')
    return session_view(db,s,user)


def session_view(db,s,user):
    items=[]
    synchronize_feedback(db,user)
    complete=s.status=='completed'
    for item in db.scalars(select(Item).where(Item.session_id==s.id).order_by(Item.position)):
        v=db.get(Version,item.version_id)
        attempt=db.scalar(select(Attempt).where(Attempt.item_id==item.id))
        permitted=attempt and feedback_available(s,attempt)
        items.append({'id':item.id,'version_id':v.id,'position':item.position,'node_id':v.node_id,'tier':v.tier,'stem':v.content['stem'],'options':v.content['options'],'draft':item.draft,'flagged':item.flagged,'submitted':bool(attempt),'feedback_available_at':(attempt.created+timedelta(seconds=FEEDBACK_DELAY_SECONDS)).isoformat()+'Z' if attempt else None,'feedback':{'correct':attempt.correct,'answer':v.content['answer'],'solution':v.content['solution'],'error':attempt.error} if permitted else None})
    return {'id':s.id,'subject':s.subject,'mode':s.mode,'release':s.release_id,'status':s.status,'calculator':s.calculator,'tier':s.tier,'deadline':s.deadline,'server_time':now().isoformat()+'Z','feedback_delay_seconds':FEEDBACK_DELAY_SECONDS,'items':items,'limit':8,'report':overlays(db,user.id) if complete else None}


@app.get(API+'/assessments/{sid}')
def read_session(sid:str,user:User=Depends(current),db:Session=Depends(database)):
    return session_view(db,own_session(db,sid,user),user)


class Draft(Strict):
    selected:Literal['A','B','C','D']|None=None
    flagged:bool=False


@app.put(API+'/assessments/{sid}/items/{iid}/draft')
def draft(sid:str,iid:str,body:Draft,user:User=Depends(current),db:Session=Depends(database)):
    s=own_session(db,sid,user,True)
    item=db.get(Item,iid)
    if not item or item.session_id!=s.id: raise HTTPException(404)
    if s.status!='active' or db.scalar(select(Attempt).where(Attempt.item_id==iid)): raise HTTPException(409,'Answer is locked')
    item.draft=body.selected; item.flagged=body.flagged
    return {'saved':True}


class Answer(Strict):
    selected:Literal['A','B','C','D']
    seconds:float=Field(ge=0,le=7200)
    calculator_used:bool=False


@app.post(API+'/assessments/{sid}/items/{iid}/answer')
def answer(sid:str,iid:str,body:Answer,user:User=Depends(current),db:Session=Depends(database)):
    s=own_session(db,sid,user,True)
    item=db.get(Item,iid)
    if not item or item.session_id!=s.id: raise HTTPException(404)
    existing=db.scalar(select(Attempt).where(Attempt.item_id==iid))
    if existing:
        if existing.selected!=body.selected: raise HTTPException(409,'Submitted answer cannot be modified')
        return session_view(db,s,user)
    if s.status!='active': raise HTTPException(409,'Session is complete')
    if s.deadline and now()>s.deadline: raise HTTPException(409,'Exam time limit reached; complete the session')
    if body.calculator_used and not s.calculator: raise HTTPException(403,'Calculator prohibited')
    v=db.get(Version,item.version_id)
    first=not db.scalar(select(Attempt.id).where(Attempt.user_id==user.id,Attempt.version_id==v.id).limit(1))
    a=Attempt(item_id=iid,user_id=user.id,version_id=v.id,selected=body.selected,correct=body.selected==v.content['answer'],first=first,seconds=body.seconds,mode=s.mode,calculator_used=body.calculator_used)
    db.add(a); item.draft=body.selected; db.flush()
    # Mastery and review schedules are materialized only after feedback eligibility.
    adapt(s,a.correct)
    db.flush()
    count=db.scalar(select(func.count()).select_from(Item).where(Item.session_id==sid))
    if count>=8: s.status='completed'
    else: next_item(db,s)
    db.flush()
    return session_view(db,s,user)


@app.post(API+'/assessments/{sid}/complete')
def complete(sid:str,user:User=Depends(current),db:Session=Depends(database)):
    s=own_session(db,sid,user,True); s.status='completed'
    return session_view(db,s,user)


class NoteBody(Strict):
    title:str=Field(min_length=1,max_length=120)
    body:str=Field(default='',max_length=20000)
    formula:str=Field(default='',max_length=4000)
    node_id:str|None=None


@app.get(API+'/notes')
def notes(user:User=Depends(current),db:Session=Depends(database)):
    return [{'id':n.id,'title':n.title,'body':n.body,'formula':n.formula,'node_id':n.node_id,'updated':n.updated} for n in db.scalars(select(Note).where(Note.user_id==user.id).order_by(Note.updated.desc()).limit(100))]


@app.put(API+'/notes/{nid}')
def save_note(nid:str,body:NoteBody,user:User=Depends(current),db:Session=Depends(database)):
    if body.node_id and not db.get(Node,body.node_id): raise HTTPException(422,'Unknown node')
    n=db.get(Note,nid)
    if n and n.user_id!=user.id: raise HTTPException(404)
    if not n:
        n=Note(id=nid,user_id=user.id,title=body.title,body=body.body); db.add(n)
    for key,value in body.model_dump().items(): setattr(n,key,value)
    n.updated=now(); db.flush()
    return {'id':n.id,'saved':True}


@app.get(API+'/analytics')
def stats(subject:Literal['math','physics']|None=None,node:str|None=None,tier:int|None=None,start:datetime|None=None,end:datetime|None=None,user:User=Depends(current),db:Session=Depends(database)):
    synchronize_feedback(db,user)
    return analytics(db,user.id,subject,node,tier,start,end)


@app.get(API+'/reviews')
def reviews(user:User=Depends(current),db:Session=Depends(database)):
    synchronize_feedback(db,user)
    return [{'node_id':r.node_id,'name':db.get(Node,r.node_id).name,'due':r.due,'interval_days':r.interval_days,'overdue':r.due<=now()} for r in db.scalars(select(Review).where(Review.user_id==user.id).order_by(Review.due))]


class Calculation(Strict):
    expression:str=Field(min_length=1,max_length=150)
    degrees:bool=False
    precision:int=Field(default=10,ge=1,le=14)
    session_id:str|None=None


@app.post(API+'/calculate')
def calc(body:Calculation,user:User=Depends(current),db:Session=Depends(database)):
    if body.session_id and not own_session(db,body.session_id,user).calculator: raise HTTPException(403,'Calculator prohibited in this session')
    try: return {'result':calculate(body.expression,body.degrees,body.precision)}
    except Exception: raise HTTPException(422,'Invalid expression, domain error, division by zero or overflow')


@app.get(API+'/admin/overview')
def overview(user:User=Depends(admin),db:Session=Depends(database)):
    return {'active':db.get(Active,1).release_id,'questions':db.scalar(select(func.count()).select_from(Version)),'users':db.scalar(select(func.count()).select_from(User)),'provider':{'status':'mock-only','generation':'not enabled','independence':'No real multi-model review configured'},'jobs':[{'id':j.id,'status':j.status,'report':j.report,'created':j.created} for j in db.scalars(select(Job).order_by(Job.created.desc()).limit(30))],'audit':[{'action':a.action,'detail':a.detail,'created':a.created} for a in db.scalars(select(Audit).order_by(Audit.created.desc()).limit(30))],'refresh_days':settings.refresh_days}


@app.get(API+'/admin/questions')
def questions(offset:int=0,limit:int=30,user:User=Depends(admin),db:Session=Depends(database)):
    if offset<0 or not 1<=limit<=100: raise HTTPException(422)
    return [{'id':v.id,'state':v.state,'content':v.content,'evidence':[e.report for e in db.scalars(select(Evidence).where(Evidence.version_id==v.id))]} for v in db.scalars(select(Version).order_by(Version.id).offset(offset).limit(limit))]


class Decision(Strict):
    action:Literal['approve','reject','quarantine','revalidate']
    reason:str=Field(min_length=5,max_length=1000)


@app.post(API+'/admin/questions/{vid}/decision')
def decision(vid:str,body:Decision,user:User=Depends(admin),db:Session=Depends(database)):
    from .validation import pipeline
    v=db.get(Version,vid)
    if not v: raise HTTPException(404)
    # Do not mutate eligibility for already-released versions: make a revision.
    if db.scalar(select(Member).where(Member.version_id==vid).limit(1)): raise HTTPException(409,'Released version is frozen; create a revision')
    if body.action in ('approve','revalidate'):
        report=pipeline(v.content); db.add(Evidence(version_id=vid,report=report))
        if body.action=='approve' and (not report['approved'] or settings.environment=='production'): raise HTTPException(409,'Mandatory verification unavailable or failed')
        v.state='approved' if report['approved'] else 'quarantined'
    else: v.state='rejected' if body.action=='reject' else 'quarantined'
    db.add(Audit(actor=user.id,action='question.'+body.action,detail={'version':vid,'reason':body.reason}))
    return {'state':v.state}


@app.post(API+'/admin/questions/{vid}/revision')
def revision(vid:str,user:User=Depends(admin),db:Session=Depends(database)):
    v=db.get(Version,vid)
    if not v: raise HTTPException(404)
    # Return a new revision draft without replacing the original content.
    raw=dict(v.content); raw['stem']=raw['stem']+' Give the requested value.'
    from .validation import QuestionSpec,fingerprint
    content_hash=fingerprint(QuestionSpec.model_validate(raw))
    existing=db.scalar(select(Version).where(Version.fingerprint==content_hash))
    if existing: return {'id':existing.id,'deduplicated':True}
    new=Version(id=uid(),question_id=v.question_id,node_id=v.node_id,tier=v.tier,content=raw,fingerprint=content_hash,state='draft')
    db.add(new); db.flush()
    db.add(Audit(actor=user.id,action='question.revision',detail={'original':vid,'revision':new.id}))
    return {'id':new.id}


@app.get(API+'/admin/releases')
def releases(user:User=Depends(admin),db:Session=Depends(database)):
    return [{'id':r.id,'state':r.state,'report':r.report,'created':r.created} for r in db.scalars(select(Release).order_by(Release.created.desc()).limit(50))]


class Candidate(Strict):
    copy_active:bool=True


@app.post(API+'/admin/releases')
def candidate(body:Candidate,user:User=Depends(admin),db:Session=Depends(database)):
    r=Release(id='candidate-'+uid(),state='candidate'); db.add(r); db.flush()
    if body.copy_active:
        for m in db.scalars(select(Member).where(Member.release_id==db.get(Active,1).release_id)):
            db.add(Member(release_id=r.id,version_id=m.version_id))
    db.add(Audit(actor=user.id,action='release.candidate',detail={'release':r.id,'copied':body.copy_active}))
    return {'id':r.id}


@app.post(API+'/admin/releases/{rid}/validate')
def validate(rid:str,user:User=Depends(admin),db:Session=Depends(database)):
    r=db.get(Release,rid)
    if not r: raise HTTPException(404)
    return validate_release(db,r)


class Reason(Strict):
    reason:str=Field(min_length=5,max_length=1000)


@app.post(API+'/admin/releases/{rid}/activate')
def switch(rid:str,body:Reason,user:User=Depends(admin),db:Session=Depends(database)):
    try: return activate(db,rid,user.id,body.reason)
    except ValueError as exc: raise HTTPException(409,str(exc))


@app.post(API+'/admin/refresh')
def refresh(user:User=Depends(admin)):
    from .tasks import refresh_bank
    try:
        job=refresh_bank.delay()
        return {'queued':True,'task_id':job.id}
    except Exception: raise HTTPException(503,'Queue unavailable; active release unchanged. Start Redis and worker services.')
