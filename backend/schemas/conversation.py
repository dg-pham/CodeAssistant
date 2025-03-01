# Trong conversation.py
from typing import List, Optional
from pydantic import BaseModel

from backend.schemas.message import MessageResponse


class ConversationBase(BaseModel):
    user_id: str
    title: Optional[str] = "New Conversation"


class ConversationCreate(ConversationBase):
    id: Optional[str] = None


class ConversationResponse(ConversationBase):
    id: str

    class Config:
        from_attributes = True


class ConversationWithMessagesResponse(ConversationResponse):
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ConversationUpdate(BaseModel):
    title: Optional[str] = None