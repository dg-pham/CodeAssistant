from typing import List

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.feedback import Feedback
from backend.db.services.feedback import FeedbackService
from backend.agent_managers.feedback import FeedbackManager  # Giả sử bạn giữ lại phần xử lý này

router = APIRouter()
feedback_manager = FeedbackManager()  # Dùng cho xử lý phản hồi để học hỏi

@router.post("/feedback", response_model=dict)
async def submit_feedback(feedback: Feedback, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Gửi phản hồi cho câu trả lời"""
    feedback_service = FeedbackService(session)
    feedback_id = feedback_service.save_feedback(feedback)

    # Xử lý phản hồi để học hỏi - giả sử bạn vẫn dùng process_feedback_for_learning
    # Bạn cần cập nhật hàm này để sử dụng ORM
    feedback_manager.process_feedback_for_learning(feedback, background_tasks)

    return {"feedback_id": feedback_id}

@router.get("/feedback/{feedback_id}", response_model=Feedback)
async def get_feedback(feedback_id: str, session: Session = Depends(get_session)):
    """Lấy thông tin phản hồi"""
    feedback_service = FeedbackService(session)
    feedback = feedback_service.get_feedback(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback

@router.get("/messages/{message_id}/feedback", response_model=List[Feedback])
async def get_message_feedback(message_id: str, session: Session = Depends(get_session)):
    """Lấy tất cả phản hồi cho một tin nhắn"""
    feedback_service = FeedbackService(session)
    feedback_list = feedback_service.get_message_feedback(message_id)
    return feedback_list

@router.get("/conversations/{conversation_id}/rating", response_model=dict)
async def get_conversation_rating(conversation_id: str, session: Session = Depends(get_session)):
    """Lấy điểm đánh giá trung bình cho một cuộc hội thoại"""
    feedback_service = FeedbackService(session)
    avg_rating = feedback_service.get_average_rating(conversation_id)
    return {"conversation_id": conversation_id, "average_rating": avg_rating}