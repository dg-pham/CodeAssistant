from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class CodeResponse(BaseModel):
    status: str
    result: str
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None
    additional_info: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None