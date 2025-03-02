import uuid
from typing import Optional, List
from sqlmodel import Session, select
from datetime import datetime, timezone, timedelta

from backend.db.models.feedback import Feedback
from backend.db.models.message import Message
from backend.db.services import MessageService
from backend.decorators import db_transaction
from backend.utils.helpers import vietnam_now


class FeedbackService:
    def __init__(self, session: Session):
        self.session = session
        self.message_service = MessageService(session)

    @db_transaction
    def save_feedback(self, feedback: Feedback) -> str:
        """Lưu phản hồi"""
        message = self.message_service.get_message(feedback.message_id)
        if not message:
            raise ValueError(f"Message with ID {feedback.message_id} does not exist")

        feedback_id = feedback.id or str(uuid.uuid4())
        feedback.id = feedback_id

        # Thêm timestamp nếu chưa có
        if not hasattr(feedback, "created_at") or feedback.created_at is None:
            feedback.created_at = vietnam_now()

        self.session.add(feedback)
        self.session.commit()
        self.session.refresh(feedback)

        return feedback.id

    @db_transaction
    def get_feedback(self, feedback_id: str) -> Optional[Feedback]:
        """Lấy thông tin phản hồi theo ID"""
        return self.session.exec(
            select(Feedback).where(Feedback.id == feedback_id)
        ).first()

    @db_transaction
    def get_message_feedback(self, message_id: str) -> List[Feedback]:
        """Lấy tất cả phản hồi cho một tin nhắn"""
        return self.session.exec(
            select(Feedback).where(Feedback.message_id == message_id)
        ).all()

    @db_transaction
    def get_average_rating(self, conversation_id: Optional[str] = None) -> float:
        """Lấy điểm đánh giá trung bình cho một cuộc hội thoại hoặc toàn bộ"""
        if conversation_id:
            # Lấy tất cả message_id từ cuộc hội thoại
            message_ids = self.session.exec(
                select(Message.id).where(Message.conversation_id == conversation_id)
            ).all()

            # Lấy đánh giá cho các tin nhắn này
            ratings = self.session.exec(
                select(Feedback.rating).where(Feedback.message_id.in_(message_ids))
            ).all()
        else:
            # Lấy tất cả đánh giá
            ratings = self.session.exec(select(Feedback.rating)).all()

        # Tính trung bình
        if not ratings:
            return 0.0
        return sum(ratings) / len(ratings)

    @db_transaction
    def update_feedback(self, feedback_id: str, **kwargs) -> Optional[Feedback]:
        """Cập nhật thông tin phản hồi"""
        feedback = self.get_feedback(feedback_id)
        if not feedback:
            return None

        for key, value in kwargs.items():
            if hasattr(feedback, key):
                setattr(feedback, key, value)

        self.session.add(feedback)
        self.session.commit()
        self.session.refresh(feedback)

        return feedback