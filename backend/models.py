from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    text: str
    sender: str  # 'user' or 'ai'
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = None

class MessageCreate(BaseModel):
    message: str
    session_id: str

class MessageResponse(BaseModel):
    response: str
    message_id: str
    timestamp: datetime

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0

class SessionCreate(BaseModel):
    name: Optional[str] = None

class SessionResponse(BaseModel):
    session_id: str
    name: str
    last_message: Optional[str] = None
    updated_at: datetime
    message_count: int