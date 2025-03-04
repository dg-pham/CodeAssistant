import uuid
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select

from backend.db.models.workflow import (
    Workflow, WorkflowNode, WorkflowEdge,
    WorkflowExecution, WorkflowExecutionStep
)
from backend.db.services.user import UserService
from backend.decorators import db_transaction
from backend.utils.helpers import vietnam_now

class WorkflowService:
    def __init__(self, session: Session):
        self.session = session
        self.user_service = UserService(session)

    # === Workflow CRUD ===
    @db_transaction
    def create_workflow(self, workflow: Workflow) -> str:
        """Tạo một workflow mới"""
        user = self.user_service.get_user(workflow.user_id)
        if not user:
            raise ValueError(f"User with ID {workflow.user_id} does not exist")

        workflow_id = workflow.id or str(uuid.uuid4())
        workflow.id = workflow_id

        if not hasattr(workflow, "created_at") or workflow.created_at is None:
            workflow.created_at = vietnam_now()
        workflow.updated_at = vietnam_now()

        self.session.add(workflow)
        self.session.commit()
        self.session.refresh(workflow)

        return workflow.id

    @db_transaction
    def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """Lấy một workflow theo ID"""
        return self.session.exec(
            select(Workflow).where(Workflow.id == workflow_id)
        ).first()

    @db_transaction
    def get_user_workflows(self, user_id: str) -> List[Workflow]:
        """Lấy tất cả workflow của một người dùng"""
        return self.session.exec(
            select(Workflow).where(Workflow.user_id == user_id)
        ).all()

    @db_transaction
    def update_workflow(self, workflow_id: str, **kwargs) -> Optional[Workflow]:
        """Cập nhật thông tin của một workflow"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return None

        for key, value in kwargs.items():
            if hasattr(workflow, key):
                setattr(workflow, key, value)

        workflow.updated_at = vietnam_now()
        self.session.add(workflow)
        self.session.commit()
        self.session.refresh(workflow)

        return workflow

    @db_transaction
    def delete_workflow(self, workflow_id: str) -> bool:
        """Xóa một workflow"""
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return False

        self.session.delete(workflow)
        self.session.commit()

        return True

    # === Node CRUD ===
    @db_transaction
    def add_node(self, node: WorkflowNode) -> str:
        """Thêm node vào workflow"""
        workflow = self.get_workflow(node.workflow_id)
        if not workflow:
            raise ValueError(f"Workflow with ID {node.workflow_id} does not exist")

        node_id = node.id or str(uuid.uuid4())
        node.id = node_id

        self.session.add(node)
        self.session.commit()
        self.session.refresh(node)

        return node.id

    @db_transaction
    def get_node(self, node_id: str) -> Optional[WorkflowNode]:
        """Lấy node theo ID"""
        return self.session.exec(
            select(WorkflowNode).where(WorkflowNode.id == node_id)
        ).first()

    @db_transaction
    def get_workflow_nodes(self, workflow_id: str) -> List[WorkflowNode]:
        """Lấy tất cả node của một workflow"""
        return self.session.exec(
            select(WorkflowNode).where(WorkflowNode.workflow_id == workflow_id)
        ).all()

    @db_transaction
    def update_node(self, node_id: str, **kwargs) -> Optional[WorkflowNode]:
        """Cập nhật thông tin của một node"""
        node = self.get_node(node_id)
        if not node:
            return None

        for key, value in kwargs.items():
            if hasattr(node, key):
                setattr(node, key, value)

        node.updated_at = vietnam_now()
        self.session.add(node)
        self.session.commit()
        self.session.refresh(node)

        return node

    @db_transaction
    def delete_node(self, node_id: str) -> bool:
        """Xóa một node"""
        node = self.get_node(node_id)
        if not node:
            return False

        # Xóa tất cả edges liên quan đến node này
        edges = self.session.exec(
            select(WorkflowEdge).where(
                (WorkflowEdge.source_id == node_id) |
                (WorkflowEdge.target_id == node_id)
            )
        ).all()

        for edge in edges:
            self.session.delete(edge)

        self.session.delete(node)
        self.session.commit()

        return True

    # === Edge CRUD ===
    @db_transaction
    def add_edge(self, edge: WorkflowEdge) -> str:
        """Thêm edge vào workflow"""
        # Kiểm tra workflow tồn tại
        workflow = self.get_workflow(edge.workflow_id)
        if not workflow:
            raise ValueError(f"Workflow with ID {edge.workflow_id} does not exist")

        # Kiểm tra source và target node tồn tại
        source_node = self.get_node(edge.source_id)
        if not source_node:
            raise ValueError(f"Source node with ID {edge.source_id} does not exist")

        target_node = self.get_node(edge.target_id)
        if not target_node:
            raise ValueError(f"Target node with ID {edge.target_id} does not exist")

        # Kiểm tra source và target thuộc cùng workflow
        if source_node.workflow_id != edge.workflow_id or target_node.workflow_id != edge.workflow_id:
            raise ValueError("Source and target nodes must belong to the same workflow")

        edge_id = edge.id or str(uuid.uuid4())
        edge.id = edge_id

        self.session.add(edge)
        self.session.commit()
        self.session.refresh(edge)

        return edge.id

    @db_transaction
    def get_edge(self, edge_id: str) -> Optional[WorkflowEdge]:
        """Lấy edge theo ID"""
        return self.session.exec(
            select(WorkflowEdge).where(WorkflowEdge.id == edge_id)
        ).first()

    @db_transaction
    def get_workflow_edges(self, workflow_id: str) -> List[WorkflowEdge]:
        """Lấy tất cả edge của một workflow"""
        return self.session.exec(
            select(WorkflowEdge).where(WorkflowEdge.workflow_id == workflow_id)
        ).all()

    @db_transaction
    def update_edge(self, edge_id: str, **kwargs) -> Optional[WorkflowEdge]:
        """Cập nhật thông tin của một edge"""
        edge = self.get_edge(edge_id)
        if not edge:
            return None

        for key, value in kwargs.items():
            if hasattr(edge, key):
                setattr(edge, key, value)

        edge.updated_at = vietnam_now()
        self.session.add(edge)
        self.session.commit()
        self.session.refresh(edge)

        return edge

    @db_transaction
    def delete_edge(self, edge_id: str) -> bool:
        """Xóa một edge"""
        edge = self.get_edge(edge_id)
        if not edge:
            return False

        self.session.delete(edge)
        self.session.commit()

        return True

    # === Execution functions ===
    @db_transaction
    def create_execution(self, execution: WorkflowExecution) -> str:
        """Tạo một execution mới"""
        workflow = self.get_workflow(execution.workflow_id)
        if not workflow:
            raise ValueError(f"Workflow with ID {execution.workflow_id} does not exist")

        execution_id = execution.id or str(uuid.uuid4())
        execution.id = execution_id

        self.session.add(execution)
        self.session.commit()
        self.session.refresh(execution)

        return execution.id

    @db_transaction
    def add_execution_step(self, step: WorkflowExecutionStep) -> str:
        """Thêm một bước thực thi"""
        step_id = step.id or str(uuid.uuid4())
        step.id = step_id

        self.session.add(step)
        self.session.commit()
        self.session.refresh(step)

        return step.id

    @db_transaction
    def get_execution(self, execution_id: str) -> Optional[WorkflowExecution]:
        """Lấy thông tin execution"""
        return self.session.exec(
            select(WorkflowExecution).where(WorkflowExecution.id == execution_id)
        ).first()

    @db_transaction
    def get_execution_steps(self, execution_id: str) -> List[WorkflowExecutionStep]:
        """Lấy các bước thực thi của một execution"""
        return self.session.exec(
            select(WorkflowExecutionStep).where(WorkflowExecutionStep.execution_id == execution_id)
        ).all()

    @db_transaction
    def update_execution(self, execution_id: str, **kwargs) -> Optional[WorkflowExecution]:
        """Cập nhật thông tin của một execution"""
        execution = self.get_execution(execution_id)
        if not execution:
            return None

        for key, value in kwargs.items():
            if hasattr(execution, key):
                setattr(execution, key, value)

        self.session.add(execution)
        self.session.commit()
        self.session.refresh(execution)

        return execution

    @db_transaction
    def update_execution_step(self, step_id: str, **kwargs) -> Optional[WorkflowExecutionStep]:
        """Cập nhật thông tin của một step trong execution"""
        step = self.session.exec(
            select(WorkflowExecutionStep).where(WorkflowExecutionStep.id == step_id)
        ).first()

        if not step:
            return None

        for key, value in kwargs.items():
            if hasattr(step, key):
                setattr(step, key, value)

        self.session.add(step)
        self.session.commit()
        self.session.refresh(step)

        return step