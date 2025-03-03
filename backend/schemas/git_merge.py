from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime

# Base models
class GitMergeConflictBase(BaseModel):
    file_path: str
    conflict_content: str
    our_changes: str
    their_changes: str

class GitMergeSessionBase(BaseModel):
    user_id: str
    repository_url: str
    base_branch: str
    target_branch: str

# Create models
class GitMergeConflictCreate(GitMergeConflictBase):
    session_id: str
    ai_suggestion: Optional[str] = None

class GitMergeSessionCreate(GitMergeSessionBase):
    id: Optional[str] = None
    status: str = "pending"
    conflicts: List[Dict] = []

# Update models
class GitMergeConflictUpdate(BaseModel):
    resolved_content: Optional[str] = None
    resolution_strategy: Optional[str] = None
    is_resolved: Optional[bool] = None

class GitMergeSessionUpdate(BaseModel):
    status: Optional[str] = None
    merge_result: Optional[str] = None

# Response models
class GitMergeConflictResponse(GitMergeConflictBase):
    id: str
    session_id: str
    resolved_content: Optional[str] = None
    resolution_strategy: Optional[str] = None
    is_resolved: bool
    ai_suggestion: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GitMergeSessionResponse(GitMergeSessionBase):
    id: str
    status: str
    conflicts: List[Dict] = []
    resolved_conflicts: List[Dict] = []
    merge_result: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Request models
class AnalyzeConflictRequest(BaseModel):
    session_id: str
    file_path: str
    conflict_content: str
    context: Optional[str] = None

class ResolveConflictRequest(BaseModel):
    conflict_id: str
    resolved_content: str
    resolution_strategy: str  # 'ours', 'theirs', 'custom'

class CompleteMergeRequest(BaseModel):
    session_id: str