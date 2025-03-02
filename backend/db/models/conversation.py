from typing import Optional, List
from datetime import datetime, timezone, timedelta
from sqlmodel import SQLModel, Field, Relationship

from backend.db.models.user import User
from backend.utils.helpers import vietnam_now


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    title: str = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    user: Optional[User] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")