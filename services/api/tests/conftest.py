import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db import Base, database
from app.main import app
from app.seed import seed
from app.models import User


@pytest.fixture
def db_factory():
    engine=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    @event.listens_for(engine,'connect')
    def fk(conn,_): conn.execute('PRAGMA foreign_keys=ON')
    Base.metadata.create_all(engine)
    factory=sessionmaker(engine,expire_on_commit=False)
    with factory.begin() as db: seed(db)
    yield factory
    engine.dispose()


@pytest.fixture
def client(db_factory):
    def override():
        with db_factory() as db:
            try: yield db; db.commit()
            except Exception: db.rollback(); raise
    app.dependency_overrides[database]=override
    with TestClient(app,headers={'X-Nebula-Client':'web'}) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def student(client):
    r=client.post('/api/v1/auth/demo'); assert r.status_code==200
    return r.json()


@pytest.fixture
def administrator(client,student,db_factory):
    with db_factory.begin() as db:
        db.get(User,student['id']).role='admin'
    return student
