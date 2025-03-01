import uuid
from typing import List, Optional
from sqlmodel import Session, select
from datetime import datetime

from backend.db.models.memory import AgentMemory
from backend.db.services import UserService
from backend.decorators import db_transaction


class AgentMemoryService:
    def __init__(self, session: Session):
        self.session = session
        self.user_service = UserService(session)

    @db_transaction
    def store_memory(self, memory: AgentMemory) -> str:
        """Lưu trữ một mục nhớ mới hoặc cập nhật mục nhớ hiện có"""
        user = self.user_service.get_user(memory.user_id)
        if not user:
            raise ValueError(f"User with ID {memory.user_id} does not exist")

        existing_memory = self.session.exec(
            select(AgentMemory).where(
                AgentMemory.user_id == memory.user_id,
                AgentMemory.key == memory.key
            )
        ).first()

        if existing_memory:
            # Cập nhật mục nhớ hiện có
            existing_memory.value = memory.value
            existing_memory.context = memory.context
            existing_memory.priority = memory.priority
            existing_memory.updated_at = datetime.utcnow()

            self.session.add(existing_memory)
            self.session.commit()
            self.session.refresh(existing_memory)

            return existing_memory.id
        else:
            # Tạo mục nhớ mới
            memory_id = memory.id or str(uuid.uuid4())
            memory.id = memory_id

            # Thêm timestamp nếu chưa có
            if not hasattr(memory, "created_at") or memory.created_at is None:
                memory.created_at = datetime.utcnow()
            memory.updated_at = datetime.utcnow()

            self.session.add(memory)
            self.session.commit()
            self.session.refresh(memory)

            return memory.id

    @db_transaction
    def retrieve_memories(self, user_id: str, context: Optional[str] = None, limit: int = 5) -> List[AgentMemory]:
        """Lấy các mục nhớ liên quan cho người dùng"""
        if context:
            # Lấy các mục nhớ phù hợp với ngữ cảnh
            query = select(AgentMemory).where(
                AgentMemory.user_id == user_id,
                AgentMemory.context.like(f"%{context}%")
            )
        else:
            # Lấy các mục nhớ quan trọng nhất
            query = select(AgentMemory).where(AgentMemory.user_id == user_id)

        # Sắp xếp theo ưu tiên và thời gian cập nhật
        query = query.order_by(
            AgentMemory.priority.desc(),
            AgentMemory.updated_at.desc()
        ).limit(limit)

        return self.session.exec(query).all()

    @db_transaction
    def get_memory(self, memory_id: str) -> Optional[AgentMemory]:
        """Lấy một mục nhớ theo ID"""
        return self.session.exec(
            select(AgentMemory).where(AgentMemory.id == memory_id)
        ).first()

    @db_transaction
    def get_memory_by_key(self, user_id: str, key: str) -> Optional[AgentMemory]:
        """Lấy một mục nhớ theo key"""
        return self.session.exec(
            select(AgentMemory).where(
                AgentMemory.user_id == user_id,
                AgentMemory.key == key
            )
        ).first()

    @db_transaction
    def forget_memory(self, user_id: str, key: str) -> bool:
        """Xóa một mục nhớ"""
        memory = self.get_memory_by_key(user_id, key)
        if not memory:
            return False

        self.session.delete(memory)
        self.session.commit()

        return True

    @db_transaction
    def update_memory_priority(self, user_id: str, key: str, new_priority: float) -> bool:
        """Cập nhật ưu tiên của một mục nhớ"""
        memory = self.get_memory_by_key(user_id, key)
        if not memory:
            return False

        memory.priority = new_priority
        memory.updated_at = datetime.utcnow()

        self.session.add(memory)
        self.session.commit()

        return True