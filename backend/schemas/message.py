from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class MessageBase(BaseModel):
    role: str
    content: str
    conversation_id: str


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True