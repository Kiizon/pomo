from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    started_at = Column(DateTime, nullable=False)
    duration_min = Column(Integer, nullable=False)
    kind = Column(String, nullable=False, default="work")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('duration_min BETWEEN 1 AND 180', name='check_duration'),
        CheckConstraint("kind IN ('work', 'break')", name='check_kind'),
        Index('sessions_user_started_idx', 'user_id', started_at.desc()),
    )
