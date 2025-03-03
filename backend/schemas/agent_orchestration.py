from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Base models
class AgentOrchestrationTaskBase(BaseModel):
    user_id: str
    task_type: str
    input_data: Dict[str, Any] = {}
    agent_chain: List[Dict[str, Any]] = []

class AgentTaskResultBase(BaseModel):
    task_id: str
    agent_type: str
    result_data: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}

# Create models
class AgentOrchestrationTaskCreate(AgentOrchestrationTaskBase):
    id: Optional[str] = None

class AgentTaskResultCreate(AgentTaskResultBase):
    id: Optional[str] = None

# Update models
class AgentOrchestrationTaskUpdate(BaseModel):
    status: Optional[str] = None
    output_data: Optional[Dict[str, Any]] = None
    current_agent_index: Optional[int] = None
    error_message: Optional[str] = None

# Response models
class AgentTaskResultResponse(AgentTaskResultBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AgentOrchestrationTaskResponse(AgentOrchestrationTaskBase):
    id: str
    status: str
    output_data: Dict[str, Any] = {}
    current_agent_index: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    results: List[AgentTaskResultResponse] = []

    class Config:
        from_attributes = True

# Request models
class StartOrchestrationRequest(BaseModel):
    user_id: str
    task_type: str
    input_data: Dict[str, Any]
    agent_chain: Optional[List[Dict[str, Any]]] = None  # Optional, will use default chain if not specified

class NextAgentRequest(BaseModel):
    task_id: str
    current_result: Optional[Dict[str, Any]] = None

class AbortTaskRequest(BaseModel):
    task_id: str
    reason: Optional[str] = None