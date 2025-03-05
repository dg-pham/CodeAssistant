from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, JSON

from backend.db.models.user import User
from backend.utils.helpers import vietnam_now

class Workflow(SQLModel, table=True):
    """Model cho workflow"""
    __tablename__ = "workflows"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    name: str
    description: Optional[str] = None
    meta_info: Dict[str, Any] = Field(default={}, sa_type=JSON)
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    user: Optional[User] = Relationship(back_populates="workflows")
    nodes: List["WorkflowNode"] = Relationship(back_populates="workflow", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    edges: List["WorkflowEdge"] = Relationship(back_populates="workflow", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    executions: List["WorkflowExecution"] = Relationship(back_populates="workflow", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class WorkflowNode(SQLModel, table=True):
    """Model cho node trong workflow"""
    __tablename__ = "workflow_nodes"

    id: Optional[str] = Field(default=None, primary_key=True)
    workflow_id: str = Field(foreign_key="workflows.id")
    node_type: str  # Loại agent: "code_generator", "git_analyzer", v.v.
    name: str
    description: Optional[str] = None
    position_x: float = 0
    position_y: float = 0
    config: Dict[str, Any] = Field(default={}, sa_type=JSON)  # Cấu hình node
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    workflow: Optional[Workflow] = Relationship(back_populates="nodes")
    source_edges: List["WorkflowEdge"] = Relationship(back_populates="source_node", sa_relationship_kwargs={"foreign_keys": "WorkflowEdge.source_id"})
    target_edges: List["WorkflowEdge"] = Relationship(back_populates="target_node", sa_relationship_kwargs={"foreign_keys": "WorkflowEdge.target_id"})

class WorkflowEdge(SQLModel, table=True):
    """Model cho kết nối giữa các node"""
    __tablename__ = "workflow_edges"

    id: Optional[str] = Field(default=None, primary_key=True)
    workflow_id: str = Field(foreign_key="workflows.id")
    source_id: str = Field(foreign_key="workflow_nodes.id")
    target_id: str = Field(foreign_key="workflow_nodes.id")
    edge_type: str = "default"  # Loại kết nối: "success", "failure", "default"
    conditions: Dict[str, Any] = Field(default={}, sa_type=JSON)  # Điều kiện để kích hoạt edge
    created_at: datetime = Field(default_factory=vietnam_now)
    updated_at: datetime = Field(default_factory=vietnam_now)

    # Relationships
    workflow: Optional[Workflow] = Relationship(back_populates="edges")
    source_node: Optional[WorkflowNode] = Relationship(back_populates="source_edges", sa_relationship_kwargs={"foreign_keys": "WorkflowEdge.source_id"})
    target_node: Optional[WorkflowNode] = Relationship(back_populates="target_edges", sa_relationship_kwargs={"foreign_keys": "WorkflowEdge.target_id"})

class WorkflowExecution(SQLModel, table=True):
    """Model cho lịch sử thực thi workflow"""
    __tablename__ = "workflow_executions"

    id: Optional[str] = Field(default=None, primary_key=True)
    workflow_id: str = Field(foreign_key="workflows.id")
    user_id: str = Field(foreign_key="users.id")
    status: str  # "pending", "in_progress", "completed", "failed"
    input_data: Dict[str, Any] = Field(default={}, sa_type=JSON)
    output_data: Dict[str, Any] = Field(default={}, sa_type=JSON)
    error_message: Optional[str] = None
    started_at: datetime = Field(default_factory=vietnam_now)
    completed_at: Optional[datetime] = None

    # Relationships
    workflow: Optional[Workflow] = Relationship(back_populates="executions")
    execution_steps: List["WorkflowExecutionStep"] = Relationship(back_populates="execution", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class WorkflowExecutionStep(SQLModel, table=True):
    """Model cho từng bước thực thi trong workflow"""
    __tablename__ = "workflow_execution_steps"

    id: Optional[str] = Field(default=None, primary_key=True)
    execution_id: str = Field(foreign_key="workflow_executions.id")
    node_id: str = Field(foreign_key="workflow_nodes.id")
    status: str  # "pending", "in_progress", "completed", "failed", "skipped"
    input_data: Dict[str, Any] = Field(default={}, sa_type=JSON)
    output_data: Dict[str, Any] = Field(default={}, sa_type=JSON)
    error_message: Optional[str] = None
    started_at: datetime = Field(default_factory=vietnam_now)
    completed_at: Optional[datetime] = None

    # Relationships
    execution: Optional[WorkflowExecution] = Relationship(back_populates="execution_steps")