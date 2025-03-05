from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class MessageBase(BaseModel):
    role: str
    content: str
    conversation_id: str
    meta: Optional[Dict[str, Any]] = None


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True