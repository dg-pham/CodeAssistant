from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db.base import get_session
from backend.db.models.memory import AgentMemory
from backend.db.services.memory import AgentMemoryService
from backend.db.services.user import UserService
from backend.schemas.memory import MemoryCreate, MemoryResponse
from backend.log import logger

router = APIRouter()


@router.post("/memories", response_model=MemoryResponse)
async def store_memory(memory: MemoryCreate, session: Session = Depends(get_session)):
    """Lưu trữ một mục nhớ"""
    try:
        # Validation
        if not memory.user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        if not memory.key:
            raise HTTPException(status_code=400, detail="key is required")
        if not memory.value:
            raise HTTPException(status_code=400, detail="value is required")
        if memory.priority is not None and (memory.priority < 0.0 or memory.priority > 1.0):
            raise HTTPException(status_code=400, detail="priority must be between 0.0 and 1.0")

        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(memory.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {memory.user_id} not found")

        memory_service = AgentMemoryService(session)

        # Chuyển đổi từ schema sang model
        memory_model = AgentMemory(
            user_id=memory.user_id,
            key=memory.key,
            value=memory.value,
            context=memory.context,
            priority=memory.priority
        )
        if memory.id:
            memory_model.id = memory.id

        try:
            memory_id = memory_service.store_memory(memory_model)
            created_memory = memory_service.get_memory(memory_id)

            if not created_memory:
                raise HTTPException(status_code=500, detail="Failed to create memory")

            return created_memory
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to store memory: {str(e)}")

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in store_memory: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in store_memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/users/{user_id}/memories", response_model=List[MemoryResponse])
async def get_user_memories(
        user_id: str,
        context: Optional[str] = None,
        limit: int = 10,
        session: Session = Depends(get_session)
):
    """Lấy các mục nhớ của người dùng"""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="limit must be between 1 and 100")

        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        memory_service = AgentMemoryService(session)
        memories = memory_service.retrieve_memories(user_id, context, limit)
        return memories

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_user_memories: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_user_memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/memories/{memory_id}", response_model=MemoryResponse)
async def get_memory(memory_id: str, session: Session = Depends(get_session)):
    """Lấy một mục nhớ theo ID"""
    try:
        if not memory_id:
            raise HTTPException(status_code=400, detail="memory_id is required")

        memory_service = AgentMemoryService(session)
        memory = memory_service.get_memory(memory_id)

        if not memory:
            raise HTTPException(status_code=404, detail="Memory not found")

        return memory

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_memory: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/users/{user_id}/memories/{key}", response_model=dict)
async def forget_memory(user_id: str, key: str, session: Session = Depends(get_session)):
    """Xóa một mục nhớ"""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        if not key:
            raise HTTPException(status_code=400, detail="key is required")

        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        memory_service = AgentMemoryService(session)

        # Kiểm tra memory tồn tại
        existing_memory = memory_service.get_memory_by_key(user_id, key)
        if not existing_memory:
            raise HTTPException(status_code=404, detail=f"Memory with key '{key}' not found for user {user_id}")

        success = memory_service.forget_memory(user_id, key)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete memory")

        return {"success": True, "message": f"Memory with key '{key}' has been deleted"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in forget_memory: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in forget_memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.patch("/users/{user_id}/memories/{key}/priority", response_model=dict)
async def update_memory_priority(
        user_id: str,
        key: str,
        priority: float,
        session: Session = Depends(get_session)
):
    """Cập nhật ưu tiên của một mục nhớ"""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        if not key:
            raise HTTPException(status_code=400, detail="key is required")
        if priority < 0.0 or priority > 1.0:
            raise HTTPException(status_code=400, detail="Priority must be between 0.0 and 1.0")

        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        memory_service = AgentMemoryService(session)

        # Kiểm tra memory tồn tại
        existing_memory = memory_service.get_memory_by_key(user_id, key)
        if not existing_memory:
            raise HTTPException(status_code=404, detail=f"Memory with key '{key}' not found for user {user_id}")

        success = memory_service.update_memory_priority(user_id, key, priority)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to update memory priority")

        return {
            "success": True,
            "message": f"Memory priority updated to {priority}",
            "user_id": user_id,
            "key": key,
            "priority": priority
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in update_memory_priority: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in update_memory_priority: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")