from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class MemoryBase(BaseModel):
    user_id: str
    key: str
    value: str
    context: Optional[str] = None
    priority: float = Field(default=0.5, ge=0.0, le=1.0)


class MemoryCreate(MemoryBase):
    id: Optional[str] = None


class MemoryResponse(MemoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True