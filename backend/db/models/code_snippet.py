from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, JSON

from backend.db.models.user import User


class CodeSnippet(SQLModel, table=True):
    __tablename__ = "code_snippets"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    language: str
    code: str
    description: Optional[str] = None
    tags: List[str] = Field(default=[], sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="code_snippets")