from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.memory import AgentMemory
from backend.db.services.memory import AgentMemoryService
from backend.schemas.memory import MemoryCreate, MemoryResponse

router = APIRouter()


@router.post("/memories", response_model=MemoryResponse)
async def store_memory(memory: MemoryCreate, session: Session = Depends(get_session)):
    """Lưu trữ một mục nhớ"""
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

    memory_id = memory_service.store_memory(memory_model)
    created_memory = memory_service.get_memory(memory_id)

    if not created_memory:
        raise HTTPException(status_code=500, detail="Failed to create memory")

    return created_memory


@router.get("/users/{user_id}/memories", response_model=List[MemoryResponse])
async def get_user_memories(
        user_id: str,
        context: Optional[str] = None,
        limit: int = 10,
        session: Session = Depends(get_session)
):
    """Lấy các mục nhớ của người dùng"""
    memory_service = AgentMemoryService(session)
    memories = memory_service.retrieve_memories(user_id, context, limit)
    return memories


@router.get("/memories/{memory_id}", response_model=MemoryResponse)
async def get_memory(memory_id: str, session: Session = Depends(get_session)):
    """Lấy một mục nhớ theo ID"""
    memory_service = AgentMemoryService(session)
    memory = memory_service.get_memory(memory_id)

    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    return memory


@router.delete("/users/{user_id}/memories/{key}", response_model=dict)
async def forget_memory(user_id: str, key: str, session: Session = Depends(get_session)):
    """Xóa một mục nhớ"""
    memory_service = AgentMemoryService(session)
    success = memory_service.forget_memory(user_id, key)

    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {"success": True}


@router.patch("/users/{user_id}/memories/{key}/priority", response_model=dict)
async def update_memory_priority(
        user_id: str,
        key: str,
        priority: float,
        session: Session = Depends(get_session)
):
    """Cập nhật ưu tiên của một mục nhớ"""
    if priority < 0 or priority > 1:
        raise HTTPException(status_code=400, detail="Priority must be between 0 and 1")

    memory_service = AgentMemoryService(session)
    success = memory_service.update_memory_priority(user_id, key, priority)

    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {"success": True}