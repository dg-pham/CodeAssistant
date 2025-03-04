from pydantic import Field
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

# === Workflow schema ===
class WorkflowBase(BaseModel):
    user_id: str
    name: str
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default={}, alias="meta_info")

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_field_name = False

# === Node schema ===
class WorkflowNodeBase(BaseModel):
    node_type: str  # Loại agent: "code_generator", "git_analyzer", v.v.
    name: str
    description: Optional[str] = None
    position_x: float = 0
    position_y: float = 0
    config: Dict[str, Any] = {}

class WorkflowNodeCreate(WorkflowNodeBase):
    pass

class WorkflowNodeResponse(WorkflowNodeBase):
    id: str
    workflow_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# === Edge schema ===
class WorkflowEdgeBase(BaseModel):
    source_id: str
    target_id: str
    edge_type: str = "default"  # "default", "success", "failure"
    conditions: Dict[str, Any] = {}

class WorkflowEdgeCreate(WorkflowEdgeBase):
    pass

class WorkflowEdgeResponse(WorkflowEdgeBase):
    id: str
    workflow_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# === Execution schema ===
class WorkflowExecutionCreate(BaseModel):
    user_id: str
    input_data: Dict[str, Any] = {}

class WorkflowExecutionStepResponse(BaseModel):
    id: str
    node_id: str
    status: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkflowExecutionResponse(BaseModel):
    id: str
    workflow_id: str
    user_id: str
    status: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    steps: List[WorkflowExecutionStepResponse] = []

    class Config:
        from_attributes = True