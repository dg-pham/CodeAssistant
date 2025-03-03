import uuid
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select

from backend.db.models.agent_orchestration import AgentOrchestrationTask, AgentTaskResult
from backend.db.services.user import UserService
from backend.decorators import db_transaction
from backend.utils.helpers import vietnam_now

class AgentOrchestrationService:
    def __init__(self, session: Session):
        self.session = session
        self.user_service = UserService(session)

    @db_transaction
    def create_task(self, task_data: AgentOrchestrationTask) -> str:
        """Tạo task điều phối agent mới"""
        user = self.user_service.get_user(task_data.user_id)
        if not user:
            raise ValueError(f"User with ID {task_data.user_id} does not exist")

        task_id = task_data.id or str(uuid.uuid4())
        task_data.id = task_id

        if not hasattr(task_data, "created_at") or task_data.created_at is None:
            task_data.created_at = vietnam_now()
        task_data.updated_at = vietnam_now()

        self.session.add(task_data)
        self.session.commit()
        self.session.refresh(task_data)

        return task_data.id

    @db_transaction
    def get_task(self, task_id: str) -> Optional[AgentOrchestrationTask]:
        """Lấy thông tin task"""
        return self.session.exec(
            select(AgentOrchestrationTask).where(AgentOrchestrationTask.id == task_id)
        ).first()

    @db_transaction
    def get_user_tasks(self, user_id: str) -> List[AgentOrchestrationTask]:
        """Lấy danh sách task của người dùng"""
        return self.session.exec(
            select(AgentOrchestrationTask)
            .where(AgentOrchestrationTask.user_id == user_id)
            .order_by(AgentOrchestrationTask.created_at.desc())
        ).all()

    @db_transaction
    def update_task(self, task_id: str, **kwargs) -> Optional[AgentOrchestrationTask]:
        """Cập nhật thông tin task"""
        task = self.get_task(task_id)
        if not task:
            return None

        for key, value in kwargs.items():
            if hasattr(task, key):
                setattr(task, key, value)

        task.updated_at = vietnam_now()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        return task

    @db_transaction
    def add_task_result(self, result_data: AgentTaskResult) -> str:
        """Thêm kết quả cho task"""
        task = self.get_task(result_data.task_id)
        if not task:
            raise ValueError(f"Task with ID {result_data.task_id} does not exist")

        result_id = result_data.id or str(uuid.uuid4())
        result_data.id = result_id

        if not hasattr(result_data, "created_at") or result_data.created_at is None:
            result_data.created_at = vietnam_now()

        self.session.add(result_data)
        self.session.commit()
        self.session.refresh(result_data)

        return result_data.id

    @db_transaction
    def get_task_results(self, task_id: str) -> List[AgentTaskResult]:
        """Lấy danh sách kết quả của task"""
        return self.session.exec(
            select(AgentTaskResult)
            .where(AgentTaskResult.task_id == task_id)
            .order_by(AgentTaskResult.created_at)
        ).all()

    @db_transaction
    def delete_task(self, task_id: str) -> bool:
        """Xóa task"""
        task = self.get_task(task_id)
        if not task:
            return False

        # Delete all results first
        results = self.get_task_results(task_id)
        for result in results:
            self.session.delete(result)

        # Then delete the task
        self.session.delete(task)
        self.session.commit()

        return True