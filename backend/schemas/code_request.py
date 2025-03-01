from typing import Optional, List
from pydantic import BaseModel


class CodeRequest(BaseModel):
    action: str  # 'generate', 'optimize', 'translate', 'explain'
    code: Optional[str] = None
    language_from: Optional[str] = None
    language_to: Optional[str] = None
    description: Optional[str] = None
    comments: Optional[bool] = True
    optimization_level: Optional[str] = "medium"  # 'low', 'medium', 'high'
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
    save_snippet: Optional[bool] = False
    tags: Optional[List[str]] = []
    context: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "action": "generate",
                "language_to": "python",
                "description": "Write a function to calculate fibonacci sequence",
                "comments": True
            }
        }