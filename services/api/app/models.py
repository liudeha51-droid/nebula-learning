from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, JSON, DateTime, UniqueConstraint, CheckConstraint, Text, event
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base, uid, now


class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(20), default='student')
    profile: Mapped[dict] = mapped_column(JSON, default=dict)
    __table_args__ = (CheckConstraint("role IN ('student','admin')"),)


class Login(Base):
    __tablename__ = 'logins'
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    expires: Mapped[object] = mapped_column(DateTime)


class Node(Base):
    __tablename__ = 'knowledge_nodes'
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    subject: Mapped[str] = mapped_column(String(20), index=True)
    name: Mapped[str] = mapped_column(String(150))
    domain: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)


class Edge(Base):
    __tablename__ = 'knowledge_edges'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    source: Mapped[str] = mapped_column(ForeignKey('knowledge_nodes.id'))
    target: Mapped[str] = mapped_column(ForeignKey('knowledge_nodes.id'))
    kind: Mapped[str] = mapped_column(String(40))
    __table_args__ = (UniqueConstraint('source','target','kind'), CheckConstraint('source != target'))


class Question(Base):
    __tablename__ = 'questions'
    id: Mapped[str] = mapped_column(String(100), primary_key=True)


class Version(Base):
    __tablename__ = 'question_versions'
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    question_id: Mapped[str] = mapped_column(ForeignKey('questions.id'), index=True)
    node_id: Mapped[str] = mapped_column(ForeignKey('knowledge_nodes.id'), index=True)
    tier: Mapped[int] = mapped_column(Integer)
    content: Mapped[dict] = mapped_column(JSON)
    fingerprint: Mapped[str] = mapped_column(String(64), unique=True)
    state: Mapped[str] = mapped_column(String(30), default='draft')
    created: Mapped[object] = mapped_column(DateTime, default=now)
    __table_args__ = (CheckConstraint('tier >= 1 AND tier <= 5'),)


@event.listens_for(Version, 'before_update')
def immutable_content(mapper, connection, target):
    from sqlalchemy import inspect
    for field in ('content', 'fingerprint', 'question_id', 'node_id', 'tier'):
        if inspect(target).attrs[field].history.has_changes():
            raise ValueError('Question versions are immutable; create a new version')


class Evidence(Base):
    __tablename__ = 'review_evidence'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    version_id: Mapped[str] = mapped_column(ForeignKey('question_versions.id'), index=True)
    report: Mapped[dict] = mapped_column(JSON)
    created: Mapped[object] = mapped_column(DateTime, default=now)


class Release(Base):
    __tablename__ = 'bank_releases'
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    state: Mapped[str] = mapped_column(String(20), default='candidate')
    report: Mapped[dict] = mapped_column(JSON, default=dict)
    created: Mapped[object] = mapped_column(DateTime, default=now)


class Member(Base):
    __tablename__ = 'release_members'
    release_id: Mapped[str] = mapped_column(ForeignKey('bank_releases.id'), primary_key=True)
    version_id: Mapped[str] = mapped_column(ForeignKey('question_versions.id'), primary_key=True)


class Active(Base):
    __tablename__ = 'active_release'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    release_id: Mapped[str] = mapped_column(ForeignKey('bank_releases.id'))
    __table_args__ = (CheckConstraint('id = 1'),)


class Assessment(Base):
    __tablename__ = 'assessments'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    release_id: Mapped[str] = mapped_column(ForeignKey('bank_releases.id'))
    subject: Mapped[str] = mapped_column(String(20))
    mode: Mapped[str] = mapped_column(String(20))
    node_id: Mapped[str | None] = mapped_column(ForeignKey('knowledge_nodes.id'), nullable=True)
    tier: Mapped[int] = mapped_column(Integer, default=2)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default='active')
    calculator: Mapped[bool] = mapped_column(Boolean, default=True)
    created: Mapped[object] = mapped_column(DateTime, default=now)
    deadline: Mapped[object | None] = mapped_column(DateTime, nullable=True)


class Item(Base):
    __tablename__ = 'assessment_items'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    session_id: Mapped[str] = mapped_column(ForeignKey('assessments.id'), index=True)
    version_id: Mapped[str] = mapped_column(ForeignKey('question_versions.id'))
    position: Mapped[int] = mapped_column(Integer)
    draft: Mapped[str | None] = mapped_column(String(1), nullable=True)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False)
    __table_args__ = (UniqueConstraint('session_id', 'version_id'), UniqueConstraint('session_id','position'))


class Attempt(Base):
    __tablename__ = 'answer_attempts'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    item_id: Mapped[str] = mapped_column(ForeignKey('assessment_items.id'), unique=True)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    version_id: Mapped[str] = mapped_column(ForeignKey('question_versions.id'))
    selected: Mapped[str] = mapped_column(String(1))
    correct: Mapped[bool] = mapped_column(Boolean)
    first: Mapped[bool] = mapped_column(Boolean)
    seconds: Mapped[float] = mapped_column(Float)
    hint: Mapped[bool] = mapped_column(Boolean, default=False)
    calculator_used: Mapped[bool] = mapped_column(Boolean, default=False)
    mode: Mapped[str] = mapped_column(String(20))
    error: Mapped[str] = mapped_column(String(50), default='insufficient_evidence')
    scoring_version: Mapped[str] = mapped_column(String(30), default='choice-v1')
    created: Mapped[object] = mapped_column(DateTime, default=now, index=True)


class Mastery(Base):
    __tablename__ = 'mastery_snapshots'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    node_id: Mapped[str] = mapped_column(ForeignKey('knowledge_nodes.id'))
    alpha: Mapped[float] = mapped_column(Float)
    beta: Mapped[float] = mapped_column(Float)
    observations: Mapped[int] = mapped_column(Integer)
    attempt_id: Mapped[str] = mapped_column(ForeignKey('answer_attempts.id'), unique=True)
    created: Mapped[object] = mapped_column(DateTime, default=now)


class Note(Base):
    __tablename__ = 'notes'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), index=True)
    node_id: Mapped[str | None] = mapped_column(ForeignKey('knowledge_nodes.id'), nullable=True)
    title: Mapped[str] = mapped_column(String(120))
    body: Mapped[str] = mapped_column(Text)
    formula: Mapped[str] = mapped_column(Text, default='')
    updated: Mapped[object] = mapped_column(DateTime, default=now)


class Review(Base):
    __tablename__ = 'review_schedules'
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), primary_key=True)
    node_id: Mapped[str] = mapped_column(ForeignKey('knowledge_nodes.id'), primary_key=True)
    due: Mapped[object] = mapped_column(DateTime)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)


class Job(Base):
    __tablename__ = 'background_jobs'
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    status: Mapped[str] = mapped_column(String(30))
    report: Mapped[dict] = mapped_column(JSON, default=dict)
    created: Mapped[object] = mapped_column(DateTime, default=now)


class Audit(Base):
    __tablename__ = 'audit_logs'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    actor: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(100))
    detail: Mapped[dict] = mapped_column(JSON)
    created: Mapped[object] = mapped_column(DateTime, default=now)
