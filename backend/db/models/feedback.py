from typing import Optional
from datetime import datetime, timezone, timedelta
from sqlmodel import SQLModel, Field, Relationship

from backend.db.models.message import Message
from backend.utils.helpers import vietnam_now


class Feedback(SQLModel, table=True):
    __tablename__ = "feedback"

    id: Optional[str] = Field(default=None, primary_key=True)
    message_id: str = Field(foreign_key="messages.id")
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    message: Optional[Message] = Relationship(back_populates="feedback")