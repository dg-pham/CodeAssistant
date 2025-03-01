import uuid
from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select

from backend.db.models.conversation import Conversation
from backend.decorators import db_transaction


class ConversationService:
    def __init__(self, session: Session):
        self.session = session

    @db_transaction
    def create_conversation(self, conversation: Conversation) -> str:
        """Tạo một cuộc hội thoại mới"""

        from backend.db.services.user import UserService
        user_service = UserService(self.session)
        user = user_service.get_user(conversation.user_id)

        if not user:
            raise ValueError(f"User with ID {conversation.user_id} does not exist")

        conversation_id = conversation.id or str(uuid.uuid4())
        conversation.id = conversation_id

        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)

        return conversation.id

    @db_transaction
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Lấy cuộc hội thoại theo ID"""
        return self.session.exec(
            select(Conversation).where(Conversation.id == conversation_id)
        ).first()

    @db_transaction
    def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """Lấy tất cả cuộc hội thoại của một người dùng"""
        return self.session.exec(
            select(Conversation).where(Conversation.user_id == user_id)
        ).all()

    @db_transaction
    def update_conversation(self, conversation_id: str, **kwargs):
        """Cập nhật thông tin của cuộc hội thoại"""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None

        for key, value in kwargs.items():
            if hasattr(conversation, key):
                setattr(conversation, key, value)

        conversation.updated_at = datetime.utcnow()
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation