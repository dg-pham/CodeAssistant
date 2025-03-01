import uuid
from datetime import datetime
from typing import Optional, List

from sqlmodel import Session, select

from backend.db.models.conversation import Conversation


class ConversationService:
    def __init__(self, session: Session):
        self.session = session

    def create_conversation(self, conversation: Conversation) -> str:
        """Tạo một cuộc hội thoại mới"""
        conversation_id = conversation.id or str(uuid.uuid4())
        conversation.id = conversation_id

        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)

        return conversation.id

    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """Lấy cuộc hội thoại theo ID"""
        return self.session.exec(
            select(Conversation).where(Conversation.id == conversation_id)
        ).first()

    def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """Lấy tất cả cuộc hội thoại của một người dùng"""
        return self.session.exec(
            select(Conversation).where(Conversation.user_id == user_id)
        ).all()

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
