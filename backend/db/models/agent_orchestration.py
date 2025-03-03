from typing import Optional, List, Dict
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, JSON

from backend.db.models.user import User
from backend.utils.helpers import vietnam_now

class AgentOrchestrationTask(SQLModel, table=True):
    __tablename__ = "agent_orchestration_tasks"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    task_type: str  # "code_generation", "git_merge", "optimize", "translate", etc.
    status: str  # "pending", "in_progress", "completed", "failed"
    input_data: Dict = Field(default={}, sa_type=JSON)
    output_data: Dict = Field(default={}, sa_type=JSON)
    agent_chain: List[Dict] = Field(default=[], sa_type=JSON)  # Chain of agents to execute
    current_agent_index: int = 0
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    user: Optional[User] = Relationship(back_populates="orchestration_tasks")
    results: List["AgentTaskResult"] = Relationship(back_populates="task")  # Đảm bảo tên này khớp

class AgentTaskResult(SQLModel, table=True):
    __tablename__ = "agent_task_results"

    id: Optional[str] = Field(default=None, primary_key=True)
    task_id: str = Field(foreign_key="agent_orchestration_tasks.id")
    agent_type: str  # Type of agent that produced this result
    result_data: Dict = Field(default={}, sa_type=JSON)
    meta_info: Dict = Field(default={}, sa_type=JSON)  # Đã sửa từ metadata thành meta_info
    created_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    task: Optional[AgentOrchestrationTask] = Relationship(back_populates="results")  # Đảm bảo back_populates đến "results"