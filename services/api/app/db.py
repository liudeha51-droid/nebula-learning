from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings


def uid():
    return str(uuid4())


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url, connect_args={'check_same_thread': False} if settings.database_url.startswith('sqlite') else {}, pool_pre_ping=True)
if settings.database_url.startswith('sqlite'):
    @event.listens_for(engine, 'connect')
    def sqlite_constraints(conn, _):
        conn.execute('PRAGMA foreign_keys=ON')

SessionLocal = sessionmaker(engine, expire_on_commit=False)


def database():
    with SessionLocal() as db:
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
