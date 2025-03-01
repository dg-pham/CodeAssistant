import uuid
from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from backend.db.models.code_snippet import CodeSnippet


class CodeSnippetService:
    def __init__(self, session: Session):
        self.session = session

    def save_snippet(self, snippet: CodeSnippet) -> str:
        """Lưu đoạn mã"""
        snippet_id = snippet.id or str(uuid.uuid4())
        snippet.id = snippet_id

        # Thêm timestamp nếu chưa có
        if not hasattr(snippet, "created_at") or snippet.created_at is None:
            snippet.created_at = datetime.utcnow()
        snippet.updated_at = datetime.utcnow()

        self.session.add(snippet)
        self.session.commit()
        self.session.refresh(snippet)

        return snippet.id

    def get_snippet(self, snippet_id: str) -> Optional[CodeSnippet]:
        """Lấy đoạn mã theo ID"""
        return self.session.exec(
            select(CodeSnippet).where(CodeSnippet.id == snippet_id)
        ).first()

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

    def update_snippet(self, snippet_id: str, **kwargs) -> Optional[CodeSnippet]:
        """Cập nhật thông tin của đoạn mã"""
        snippet = self.get_snippet(snippet_id)
        if not snippet:
            return None

        for key, value in kwargs.items():
            if hasattr(snippet, key):
                setattr(snippet, key, value)

        snippet.updated_at = datetime.utcnow()

        self.session.add(snippet)
        self.session.commit()
        self.session.refresh(snippet)

        return snippet

    def delete_snippet(self, snippet_id: str) -> bool:
        """Xóa một đoạn mã"""
        snippet = self.get_snippet(snippet_id)
        if not snippet:
            return False

        self.session.delete(snippet)
        self.session.commit()

        return True

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
