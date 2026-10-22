"""Dedicated Celery beat, not a web-process timer. No unsafe automatic publishing."""
from celery import Celery
from sqlalchemy.exc import IntegrityError
from .config import settings
from .db import SessionLocal, now
from .models import Job

celery=Celery('nebula',broker=settings.redis_url,backend=settings.redis_url)
celery.conf.update(task_soft_time_limit=60,task_time_limit=90,broker_connection_timeout=3,task_publish_retry=False,beat_schedule={'bank-refresh':{'task':'nebula.refresh','schedule':settings.refresh_days*86400}})


@celery.task(name='nebula.refresh',bind=True,max_retries=2)
def refresh_bank(self):
    bucket=int(now().timestamp()//(settings.refresh_days*86400))
    key=f'refresh-{bucket}'
    with SessionLocal.begin() as db:
        if db.get(Job,key): return {'deduplicated':True,'id':key}
        # Fail closed: mock review is never evidence for an unattended refresh.
        job=Job(id=key,status='blocked',report={'reason':'Real generation, blind-solving and review adapters are not configured. No questions generated; active release unchanged.','provider':settings.ai_provider,'attempt':self.request.retries,'cost':0,'budget_used':0,'coverage_complete':False})
        db.add(job)
        try: db.flush()
        except IntegrityError:
            db.rollback()
            return {'deduplicated':True,'id':key}
    return {'id':key,'status':'blocked'}
