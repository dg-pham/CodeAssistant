import uuid
from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from backend.db.models.message import Message
from backend.db.services.conversation import ConversationService
from backend.decorators import db_transaction


class MessageService:
    def __init__(self, session: Session):
        self.session = session
        self.conversation_service = ConversationService(session)

    @db_transaction
    def add_message(self, message: Message) -> str:
        """Thêm tin nhắn vào cuộc hội thoại"""

        # Kiểm tra conversation tồn tại
        conversation = self.conversation_service.get_conversation(message.conversation_id)
        if not conversation:
            raise ValueError(f"Conversation with ID {message.conversation_id} does not exist")

        message_id = message.id or str(uuid.uuid4())
        message.id = message_id

        # Lưu tin nhắn
        self.session.add(message)

        # Cập nhật thời gian cập nhật của cuộc hội thoại
        self.conversation_service.update_conversation(
            message.conversation_id,
            updated_at=datetime.utcnow()
        )

        self.session.commit()
        self.session.refresh(message)

        return message.id

    @db_transaction
    def get_conversation_messages(self, conversation_id: str, limit: int = 10) -> List[Message]:
        """Lấy lịch sử tin nhắn của cuộc hội thoại"""

        conversation = self.conversation_service.get_conversation(conversation_id)
        if not conversation:
            raise ValueError(f"Conversation with ID {conversation_id} does not exist")

        return self.session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.timestamp.desc())
            .limit(limit)
        ).all()

    def get_message(self, message_id: str) -> Optional[Message]:
        """Lấy tin nhắn theo ID"""
        return self.session.exec(
            select(Message).where(Message.id == message_id)
        ).first()