from sqlalchemy import select,func
from app.models import Active,Job
from app.tasks import refresh_bank,celery


def test_background_refresh_blocked_and_idempotent(db_factory,monkeypatch):
    monkeypatch.setattr('app.tasks.SessionLocal',db_factory)
    with db_factory() as db: before=db.get(Active,1).release_id
    first=refresh_bank.run()
    second=refresh_bank.run()
    assert first['status']=='blocked'
    assert second['deduplicated']
    with db_factory() as db:
        assert db.get(Active,1).release_id==before
        assert db.scalar(select(func.count()).select_from(Job))==1
        job=db.scalar(select(Job))
        assert job.report['coverage_complete'] is False
        assert job.report['budget_used']==0


def test_scheduler_is_dedicated_and_14_days():
    assert celery.conf.beat_schedule['bank-refresh']['schedule']==14*86400
