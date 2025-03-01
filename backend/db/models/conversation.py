from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from backend.db.models.user import User


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    title: str = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")