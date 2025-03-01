from typing import Optional, List, Dict, Any

from pydantic import BaseModel


class User(BaseModel):
    id: Optional[str] = None
    name: str

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

class Message(BaseModel):
    role: str
    content: str
    conversation_id: str

class CodeResponse(BaseModel):
    status: str
    result: str
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None
    additional_info: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None

class Feedback(BaseModel):
    message_id: str
    rating: int  # 1-5
    comment: Optional[str] = None

class Conversation(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: Optional[str] = "New Conversation"

class CodeSnippet(BaseModel):
    id: Optional[str] = None
    user_id: str
    language: str
    code: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []

class Memory(BaseModel):
    key: str
    value: str
    context: Optional[str] = None
    priority: Optional[float] = 0.5
    user_id: str

