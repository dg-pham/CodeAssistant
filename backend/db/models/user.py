from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

from backend.utils.helpers import vietnam_now

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[str] = Field(default=None, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=vietnam_now)

    # Thêm relationships
    conversations: List["Conversation"] = Relationship(back_populates="user")
    code_snippets: List["CodeSnippet"] = Relationship(back_populates="user")
    memories: List["AgentMemory"] = Relationship(back_populates="user")
    git_merge_sessions: List["GitMergeSession"] = Relationship(back_populates="user")
    orchestration_tasks: List["AgentOrchestrationTask"] = Relationship(back_populates="user")
    workflows: List["Workflow"] = Relationship(back_populates="user")