from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[str] = Field(default=None, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
