import uuid
from typing import List, Optional

from sqlmodel import Session, select

from backend.db.models.code_snippet import CodeSnippet
from backend.db.services import UserService
from backend.decorators import db_transaction
from backend.utils.helpers import vietnam_now


class CodeSnippetService:
    def __init__(self, session: Session):
        self.session = session
        self.user_service = UserService(session)

    @db_transaction
    def save_snippet(self, snippet: CodeSnippet) -> str:
        """Lưu đoạn mã"""

        user = self.user_service.get_user(snippet.user_id)
        if not user:
            raise ValueError(f"User with ID {snippet.user_id} does not exist")

        snippet_id = snippet.id or str(uuid.uuid4())
        snippet.id = snippet_id

        if not hasattr(snippet, "created_at") or snippet.created_at is None:
            snippet.created_at = vietnam_now()
        snippet.updated_at = vietnam_now()

        self.session.add(snippet)
        self.session.commit()
        self.session.refresh(snippet)

        return snippet.id

    @db_transaction
    def get_snippet(self, snippet_id: str) -> Optional[CodeSnippet]:
        """Lấy đoạn mã theo ID"""
        return self.session.exec(
            select(CodeSnippet).where(CodeSnippet.id == snippet_id)
        ).first()

    @db_transaction
    def get_user_snippets(self, user_id: str, language: Optional[str] = None) -> List[CodeSnippet]:
        """Lấy tất cả đoạn mã của một người dùng"""
        if language:
            query = select(CodeSnippet).where(
                CodeSnippet.user_id == user_id,
                CodeSnippet.language == language
            )
        else:
            query = select(CodeSnippet).where(CodeSnippet.user_id == user_id)

        # Sắp xếp theo thời gian tạo
        query = query.order_by(CodeSnippet.created_at.desc())

        return self.session.exec(query).all()

    @db_transaction
    def update_snippet(self, snippet_id: str, **kwargs) -> Optional[CodeSnippet]:
        """Cập nhật thông tin của đoạn mã"""
        snippet = self.get_snippet(snippet_id)
        if not snippet:
            return None

        for key, value in kwargs.items():
            if hasattr(snippet, key):
                setattr(snippet, key, value)

        snippet.updated_at = vietnam_now()

        self.session.add(snippet)
        self.session.commit()
        self.session.refresh(snippet)

        return snippet

    @db_transaction
    def delete_snippet(self, snippet_id: str) -> bool:
        """Xóa một đoạn mã"""
        snippet = self.get_snippet(snippet_id)
        if not snippet:
            return False

        self.session.delete(snippet)
        self.session.commit()

        return True

    @db_transaction
    def search_snippets(self, user_id: str, query: str) -> List[CodeSnippet]:
        """Tìm kiếm đoạn mã theo nội dung hoặc mô tả"""
        search_term = f"%{query}%"

        return self.session.exec(
            select(CodeSnippet).where(
                CodeSnippet.user_id == user_id,
                (
                        CodeSnippet.code.like(search_term) |
                        CodeSnippet.description.like(search_term)
                )
            )
        ).all()
