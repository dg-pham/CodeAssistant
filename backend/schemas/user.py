from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    name: str


class UserCreate(UserBase):
    id: Optional[str] = None


class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True