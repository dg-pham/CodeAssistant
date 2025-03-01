from typing import List

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db.base import get_session
from backend.db.models.feedback import Feedback
from backend.db.services.feedback import FeedbackService
from backend.agent_managers.feedback import FeedbackManager
from backend.log import logger

router = APIRouter()
feedback_manager = FeedbackManager()


@router.post("/feedback", response_model=dict)
async def submit_feedback(feedback: Feedback, background_tasks: BackgroundTasks,
                          session: Session = Depends(get_session)):
    """Gửi phản hồi cho câu trả lời"""
    try:
        # Kiểm tra các trường bắt buộc
        if not feedback.message_id:
            raise HTTPException(status_code=400, detail="message_id is required")
        if feedback.rating < 1 or feedback.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        feedback_service = FeedbackService(session)

        try:
            feedback_id = feedback_service.save_feedback(feedback)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

        # Xử lý phản hồi để học hỏi trong background task
        try:
            background_tasks.add_task(
                feedback_manager.process_feedback_for_learning,
                feedback,
                background_tasks
            )
        except Exception as e:
            # Ghi log lỗi nhưng không làm gián đoạn API
            logger.error(f"Error processing feedback for learning: {str(e)}")

        return {"feedback_id": feedback_id, "status": "success"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in submit_feedback: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in submit_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/feedback/{feedback_id}", response_model=Feedback)
async def get_feedback(feedback_id: str, session: Session = Depends(get_session)):
    """Lấy thông tin phản hồi"""
    try:
        if not feedback_id:
            raise HTTPException(status_code=400, detail="feedback_id is required")

        feedback_service = FeedbackService(session)
        feedback = feedback_service.get_feedback(feedback_id)

        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        return feedback

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/messages/{message_id}/feedback", response_model=List[Feedback])
async def get_message_feedback(message_id: str, session: Session = Depends(get_session)):
    """Lấy tất cả phản hồi cho một tin nhắn"""
    try:
        if not message_id:
            raise HTTPException(status_code=400, detail="message_id is required")

        feedback_service = FeedbackService(session)

        try:
            feedback_list = feedback_service.get_message_feedback(message_id)
            return feedback_list
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_message_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_message_feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/conversations/{conversation_id}/rating", response_model=dict)
async def get_conversation_rating(conversation_id: str, session: Session = Depends(get_session)):
    """Lấy điểm đánh giá trung bình cho một cuộc hội thoại"""
    try:
        if not conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id is required")

        feedback_service = FeedbackService(session)

        try:
            # Kiểm tra xem conversation có tồn tại không
            from backend.db.services.conversation import ConversationService
            conversation_service = ConversationService(session)
            conversation = conversation_service.get_conversation(conversation_id)

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            avg_rating = feedback_service.get_average_rating(conversation_id)
            return {"conversation_id": conversation_id, "average_rating": avg_rating}

        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_conversation_rating: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in get_conversation_rating: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")