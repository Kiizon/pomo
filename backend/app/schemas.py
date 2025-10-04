from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal
from uuid import UUID

# User schemas
class UserBase(BaseModel):
    email: str
    name: str | None = None
    picture: str | None = None

class UserCreate(UserBase):
    google_id: str

class User(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Session schemas
class SessionCreate(BaseModel):
    started_at: datetime
    duration_min: int = Field(ge=1, le=180)
    kind: Literal["work", "break"] = "work"

class SessionResponse(BaseModel):
    id: int
    user_id: UUID
    started_at: datetime
    duration_min: int
    kind: Literal["work", "break"]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Friend schemas
class FriendRequestCreate(BaseModel):
    receiver_email: str

class FriendRequestResponse(BaseModel):
    id: UUID
    sender: User
    receiver: User
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FriendResponse(BaseModel):
    id: UUID
    name: str | None
    email: str
    picture: str | None
    pomodoros_today: int = 0
    
    class Config:
        from_attributes = True
