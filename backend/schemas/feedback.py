from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class FeedbackBase(BaseModel):
    message_id: str
    rating: int  # 1-5
    comment: Optional[str] = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackResponse(FeedbackBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True