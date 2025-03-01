from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from backend.db.models.user import User


class AgentMemory(SQLModel, table=True):
    __tablename__ = "agent_memory"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    key: str
    value: str
    context: Optional[str] = None
    priority: float = Field(default=0.5)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional[User] = Relationship(back_populates="memories")