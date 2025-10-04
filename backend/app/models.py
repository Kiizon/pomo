from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint, Index, ForeignKey, UniqueConstraint
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

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('sender_id', 'receiver_id', name='unique_friend_request'),
        CheckConstraint("status IN ('pending', 'accepted', 'rejected')", name='check_status'),
        Index('friend_requests_receiver_status_idx', 'receiver_id', 'status'),
    )

class Friendship(Base):
    __tablename__ = "friendships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'friend_id', name='unique_friendship'),
        Index('friendships_user_idx', 'user_id'),
    )
