from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class CodeSnippetBase(BaseModel):
    user_id: str
    language: str
    code: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []


class CodeSnippetCreate(CodeSnippetBase):
    id: Optional[str] = None


class CodeSnippetResponse(CodeSnippetBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True