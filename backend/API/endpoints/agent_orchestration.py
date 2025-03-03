from typing import List, Dict, Any
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db.base import get_session
from backend.db.services.agent_orchestration import AgentOrchestrationService
from backend.db.services.user import UserService
from backend.agent_managers.orchestrator import AgentOrchestrator
from backend.schemas.agent_orchestration import (
    AgentOrchestrationTaskResponse, AgentTaskResultResponse,
    StartOrchestrationRequest, NextAgentRequest, AbortTaskRequest
)
from backend.log import logger

router = APIRouter()
agent_orchestrator = AgentOrchestrator()


@router.post("/orchestration/start", response_model=Dict[str, Any])
async def start_orchestration(
        request: StartOrchestrationRequest,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session)
):
    """Bắt đầu orchestration task mới"""
    try:
        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {request.user_id} not found")

        # Bắt đầu orchestration
        task_id = await agent_orchestrator.start_orchestration(
            request.user_id,
            request.task_type,
            request.input_data,
            request.agent_chain,
            session
        )

        # Chạy orchestration
        await agent_orchestrator.run_orchestration(task_id, background_tasks)

        return {
            "status": "success",
            "message": "Orchestration started",
            "task_id": task_id
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in start_orchestration: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in start_orchestration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/orchestration/task/{task_id}", response_model=Dict[str, Any])
async def get_task_status(
        task_id: str,
        session: Session = Depends(get_session)
):
    """Lấy trạng thái của task"""
    try:
        # Lấy trạng thái
        status = await agent_orchestrator.get_task_status(task_id)

        if "error" in status:
            raise HTTPException(status_code=404, detail=status["message"])

        return status

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_task_status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/orchestration/next", response_model=Dict[str, Any])
async def next_agent(
        request: NextAgentRequest,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session)
):
    """Chuyển sang agent tiếp theo"""
    try:
        # Quyết định agent tiếp theo
        result = await agent_orchestrator.decide_next_agent(
            request.task_id,
            request.current_result
        )

        if result.get("status") == "error":
            raise HTTPException(status_code=404, detail=result["message"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in next_agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/orchestration/abort", response_model=Dict[str, Any])
async def abort_task(
        request: AbortTaskRequest,
        session: Session = Depends(get_session)
):
    """Hủy bỏ task"""
    try:
        # Hủy bỏ task
        success = await agent_orchestrator.abort_task(
            request.task_id,
            request.reason
        )

        if not success:
            raise HTTPException(status_code=404, detail="Task not found")

        return {
            "status": "success",
            "message": "Task aborted",
            "task_id": request.task_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in abort_task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/users/{user_id}/orchestration/tasks", response_model=List[AgentOrchestrationTaskResponse])
async def get_user_tasks(
        user_id: str,
        session: Session = Depends(get_session)
):
    """Lấy danh sách task của người dùng"""
    try:
        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        # Lấy danh sách task
        service = AgentOrchestrationService(session)
        tasks = service.get_user_tasks(user_id)

        return tasks

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_user_tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/orchestration/task/{task_id}", response_model=Dict[str, Any])
async def delete_task(
        task_id: str,
        session: Session = Depends(get_session)
):
    """Xóa task"""
    try:
        # Xóa task
        service = AgentOrchestrationService(session)
        success = service.delete_task(task_id)

        if not success:
            raise HTTPException(status_code=404, detail="Task not found")

        return {
            "status": "success",
            "message": "Task deleted",
            "task_id": task_id
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in delete_task: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in delete_task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")