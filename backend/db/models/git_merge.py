from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, JSON

from backend.db.models.user import User
from backend.utils.helpers import vietnam_now

class GitMergeSession(SQLModel, table=True):
    __tablename__ = "git_merge_sessions"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    repository_url: str
    base_branch: str
    target_branch: str
    status: str  # 'pending', 'in_progress', 'completed', 'failed'
    conflicts: List[dict] = Field(default=[], sa_type=JSON)
    resolved_conflicts: List[dict] = Field(default=[], sa_type=JSON)
    merge_result: Optional[str] = None
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    user: Optional[User] = Relationship(back_populates="git_merge_sessions")
    git_merge_conflicts: List["GitMergeConflict"] = Relationship(back_populates="session")  # Thêm relationship này

class GitMergeConflict(SQLModel, table=True):
    __tablename__ = "git_merge_conflicts"

    id: Optional[str] = Field(default=None, primary_key=True)
    session_id: str = Field(foreign_key="git_merge_sessions.id")
    file_path: str
    conflict_content: str
    our_changes: str
    their_changes: str
    resolved_content: Optional[str] = None
    resolution_strategy: Optional[str] = None  # 'ours', 'theirs', 'custom'
    is_resolved: bool = False
    ai_suggestion: Optional[str] = None
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    session: Optional[GitMergeSession] = Relationship(back_populates="git_merge_conflicts")  # Sửa tên relationship này