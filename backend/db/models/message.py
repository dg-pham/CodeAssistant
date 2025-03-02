from typing import Optional, List
from datetime import datetime, timezone, timedelta
from sqlmodel import SQLModel, Field, Relationship

from backend.db.models.conversation import Conversation
from backend.utils.helpers import vietnam_now


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[str] = Field(default=None, primary_key=True)
    conversation_id: str = Field(foreign_key="conversations.id")
    role: str
    content: str
    timestamp: datetime = Field(default_factory=vietnam_now)

    # Relationships
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
    feedback: List["Feedback"] = Relationship(back_populates="message")