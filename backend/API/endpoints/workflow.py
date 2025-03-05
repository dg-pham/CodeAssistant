from typing import List, Dict, Any

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.agent_managers.workflow_orchestrator import WorkflowOrchestrator
from backend.db.base import get_session
from backend.db.models.workflow import Workflow, WorkflowNode, WorkflowEdge
from backend.db.services.user import UserService
from backend.db.services.workflow import WorkflowService
from backend.log import logger
from backend.schemas.workflow import (
    WorkflowCreate, WorkflowResponse, WorkflowNodeCreate,
    WorkflowNodeResponse, WorkflowEdgeCreate, WorkflowEdgeResponse,
    WorkflowExecutionCreate, WorkflowExecutionResponse
)

router = APIRouter()
workflow_orchestrator = WorkflowOrchestrator()


# === Workflow endpoints ===
@router.post("/workflows", response_model=WorkflowResponse)
async def create_workflow(
        workflow_data: WorkflowCreate,
        session: Session = Depends(get_session)
):
    """Tạo workflow mới"""
    try:
        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(workflow_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {workflow_data.user_id} not found")

        workflow_service = WorkflowService(session)

        # Chuyển đổi từ schema sang model
        workflow_model = Workflow(
            user_id=workflow_data.user_id,
            name=workflow_data.name,
            description=workflow_data.description,
            meta_info=workflow_data.metadata
        )

        workflow_id = workflow_service.create_workflow(workflow_model)
        created_workflow = workflow_service.get_workflow(workflow_id)

        if not created_workflow:
            raise HTTPException(status_code=500, detail="Failed to create workflow")

        return created_workflow

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in create_workflow: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in create_workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
        workflow_id: str,
        session: Session = Depends(get_session)
):
    """Lấy thông tin workflow"""
    try:
        workflow_service = WorkflowService(session)
        workflow = workflow_service.get_workflow(workflow_id)

        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        return workflow

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/users/{user_id}/workflows", response_model=List[WorkflowResponse])
async def get_user_workflows(
        user_id: str,
        session: Session = Depends(get_session)
):
    """Lấy danh sách workflow của người dùng"""
    try:
        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        workflow_service = WorkflowService(session)
        workflows = workflow_service.get_user_workflows(user_id)

        return workflows

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_user_workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/workflows/{workflow_id}", response_model=Dict[str, Any])
async def delete_workflow(
        workflow_id: str,
        session: Session = Depends(get_session)
):
    """Xóa workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra workflow tồn tại
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Xóa workflow
        success = workflow_service.delete_workflow(workflow_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete workflow")

        return {"success": True, "message": "Workflow deleted successfully"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in delete_workflow: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in delete_workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# === Node endpoints ===
@router.post("/workflows/{workflow_id}/nodes", response_model=WorkflowNodeResponse)
async def add_node(
        workflow_id: str,
        node_data: WorkflowNodeCreate,
        session: Session = Depends(get_session)
):
    """Thêm node vào workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra workflow tồn tại
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found")

        # Kiểm tra node type có hợp lệ không
        if not workflow_orchestrator.get_agent_details(node_data.node_type):
            raise HTTPException(status_code=400, detail=f"Invalid node type: {node_data.node_type}")

        # Chuyển đổi từ schema sang model
        node_model = WorkflowNode(
            workflow_id=workflow_id,
            node_type=node_data.node_type,
            name=node_data.name,
            description=node_data.description,
            position_x=node_data.position_x,
            position_y=node_data.position_y,
            config=node_data.config
        )

        node_id = workflow_service.add_node(node_model)
        created_node = workflow_service.get_node(node_id)

        if not created_node:
            raise HTTPException(status_code=500, detail="Failed to create node")

        return created_node

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in add_node: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in add_node: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/workflows/{workflow_id}/nodes", response_model=List[WorkflowNodeResponse])
async def get_workflow_nodes(
        workflow_id: str,
        session: Session = Depends(get_session)
):
    """Lấy danh sách node của workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra workflow tồn tại
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found")

        nodes = workflow_service.get_workflow_nodes(workflow_id)
        return nodes

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_workflow_nodes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/nodes/{node_id}", response_model=Dict[str, Any])
async def delete_node(
        node_id: str,
        session: Session = Depends(get_session)
):
    """Xóa node khỏi workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra node tồn tại
        node = workflow_service.get_node(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node not found")

        # Xóa node
        success = workflow_service.delete_node(node_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete node")

        return {"success": True, "message": "Node deleted successfully"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in delete_node: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in delete_node: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# === Edge endpoints ===
@router.post("/workflows/{workflow_id}/edges", response_model=WorkflowEdgeResponse)
async def add_edge(
        workflow_id: str,
        edge_data: WorkflowEdgeCreate,
        session: Session = Depends(get_session)
):
    """Thêm edge vào workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra workflow tồn tại
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found")

        # Chuyển đổi từ schema sang model
        edge_model = WorkflowEdge(
            workflow_id=workflow_id,
            source_id=edge_data.source_id,
            target_id=edge_data.target_id,
            edge_type=edge_data.edge_type,
            conditions=edge_data.conditions
        )

        try:
            edge_id = workflow_service.add_edge(edge_model)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        created_edge = workflow_service.get_edge(edge_id)

        if not created_edge:
            raise HTTPException(status_code=500, detail="Failed to create edge")

        return created_edge

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in add_edge: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in add_edge: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/workflows/{workflow_id}/edges", response_model=List[WorkflowEdgeResponse])
async def get_workflow_edges(
        workflow_id: str,
        session: Session = Depends(get_session)
):
    """Lấy danh sách edge của workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra workflow tồn tại
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found")

        edges = workflow_service.get_workflow_edges(workflow_id)
        return edges

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_workflow_edges: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/edges/{edge_id}", response_model=Dict[str, Any])
async def delete_edge(
        edge_id: str,
        session: Session = Depends(get_session)
):
    """Xóa edge khỏi workflow"""
    try:
        workflow_service = WorkflowService(session)

        # Kiểm tra edge tồn tại
        edge = workflow_service.get_edge(edge_id)
        if not edge:
            raise HTTPException(status_code=404, detail="Edge not found")

        # Xóa edge
        success = workflow_service.delete_edge(edge_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete edge")

        return {"success": True, "message": "Edge deleted successfully"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in delete_edge: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in delete_edge: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


# === Execution endpoints ===
@router.post("/workflows/{workflow_id}/execute", response_model=Dict[str, Any])
async def execute_workflow(
        workflow_id: str,
        execution_data: WorkflowExecutionCreate,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session)
):
    """Thực thi workflow"""
    try:
        # Kiểm tra workflow tồn tại
        workflow_service = WorkflowService(session)
        workflow = workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail=f"Workflow with ID {workflow_id} not found")

        # Thực thi workflow
        execution_id = await workflow_orchestrator.execute_workflow(
            workflow_id=workflow_id,
            user_id=execution_data.user_id,
            input_data=execution_data.input_data,
            background_tasks=background_tasks,
            session=session
        )

        return {
            "success": True,
            "message": "Workflow execution started",
            "execution_id": execution_id
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in execute_workflow: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in execute_workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/workflow-executions/{execution_id}", response_model=WorkflowExecutionResponse)
async def get_workflow_execution(
        execution_id: str,
        session: Session = Depends(get_session)
):
    """Lấy thông tin thực thi workflow"""
    try:
        workflow_service = WorkflowService(session)
        execution = workflow_service.get_execution(execution_id)

        if not execution:
            raise HTTPException(status_code=404, detail="Workflow execution not found")

        # Lấy thêm các bước thực thi
        steps = workflow_service.get_execution_steps(execution_id)

        # Tạo response
        response = {
            **execution.dict(),
            "steps": steps
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_workflow_execution: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/workflow-agents", response_model=Dict[str, Any])
async def get_available_agents():
    """Lấy danh sách các agent có sẵn"""
    try:
        agents = workflow_orchestrator.get_available_agents()
        return {"agents": agents}

    except Exception as e:
        logger.error(f"Error in get_available_agents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")