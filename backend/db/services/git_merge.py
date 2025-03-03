import uuid
from typing import List, Optional, Dict
from sqlmodel import Session, select

from backend.db.models.git_merge import GitMergeSession, GitMergeConflict
from backend.db.services.user import UserService
from backend.decorators import db_transaction
from backend.utils.helpers import vietnam_now

class GitMergeService:
    def __init__(self, session: Session):
        self.session = session
        self.user_service = UserService(session)

    @db_transaction
    def create_session(self, session_data: GitMergeSession) -> str:
        """Tạo phiên merge git mới"""
        user = self.user_service.get_user(session_data.user_id)
        if not user:
            raise ValueError(f"User with ID {session_data.user_id} does not exist")

        session_id = session_data.id or str(uuid.uuid4())
        session_data.id = session_id

        if not hasattr(session_data, "created_at") or session_data.created_at is None:
            session_data.created_at = vietnam_now()
        session_data.updated_at = vietnam_now()

        self.session.add(session_data)
        self.session.commit()
        self.session.refresh(session_data)

        return session_data.id

    @db_transaction
    def get_session(self, session_id: str) -> Optional[GitMergeSession]:
        """Lấy thông tin phiên merge git"""
        return self.session.exec(
            select(GitMergeSession).where(GitMergeSession.id == session_id)
        ).first()

    @db_transaction
    def get_user_sessions(self, user_id: str) -> List[GitMergeSession]:
        """Lấy danh sách phiên merge git của người dùng"""
        return self.session.exec(
            select(GitMergeSession)
            .where(GitMergeSession.user_id == user_id)
            .order_by(GitMergeSession.created_at.desc())
        ).all()

    @db_transaction
    def update_session(self, session_id: str, **kwargs) -> Optional[GitMergeSession]:
        """Cập nhật thông tin phiên merge git"""
        session = self.get_session(session_id)
        if not session:
            return None

        for key, value in kwargs.items():
            if hasattr(session, key):
                setattr(session, key, value)

        session.updated_at = vietnam_now()
        self.session.add(session)
        self.session.commit()
        self.session.refresh(session)

        return session

    @db_transaction
    def add_conflict(self, conflict_data: GitMergeConflict) -> str:
        """Thêm conflict vào phiên merge git"""
        session = self.get_session(conflict_data.session_id)
        if not session:
            raise ValueError(f"Merge session with ID {conflict_data.session_id} does not exist")

        conflict_id = conflict_data.id or str(uuid.uuid4())
        conflict_data.id = conflict_id

        if not hasattr(conflict_data, "created_at") or conflict_data.created_at is None:
            conflict_data.created_at = vietnam_now()
        conflict_data.updated_at = vietnam_now()

        self.session.add(conflict_data)
        self.session.commit()
        self.session.refresh(conflict_data)

        return conflict_data.id

    @db_transaction
    def get_conflict(self, conflict_id: str) -> Optional[GitMergeConflict]:
        """Lấy thông tin conflict"""
        return self.session.exec(
            select(GitMergeConflict).where(GitMergeConflict.id == conflict_id)
        ).first()

    @db_transaction
    def get_session_conflicts(self, session_id: str) -> List[GitMergeConflict]:
        """Lấy danh sách conflict của phiên merge git"""
        return self.session.exec(
            select(GitMergeConflict)
            .where(GitMergeConflict.session_id == session_id)
            .order_by(GitMergeConflict.file_path)
        ).all()

    @db_transaction
    def update_conflict(self, conflict_id: str, **kwargs) -> Optional[GitMergeConflict]:
        """Cập nhật thông tin conflict"""
        conflict = self.get_conflict(conflict_id)
        if not conflict:
            return None

        for key, value in kwargs.items():
            if hasattr(conflict, key):
                setattr(conflict, key, value)

        conflict.updated_at = vietnam_now()
        self.session.add(conflict)
        self.session.commit()
        self.session.refresh(conflict)

        return conflict

    @db_transaction
    def delete_session(self, session_id: str) -> bool:
        """Xóa phiên merge git"""
        session = self.get_session(session_id)
        if not session:
            return False

        # Delete all conflicts first
        conflicts = self.get_session_conflicts(session_id)
        for conflict in conflicts:
            self.session.delete(conflict)

        # Then delete the session
        self.session.delete(session)
        self.session.commit()

        return True