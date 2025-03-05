from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.message import Message
from backend.db.services.conversation import ConversationService
from backend.db.services.message import MessageService
from backend.log import logger
from backend.schemas.message import MessageResponse

router = APIRouter()


@router.post("/messages", response_model=MessageResponse)
async def send_message(message: Message, session: Session = Depends(get_session)):
    """Gửi tin nhắn mới"""
    try:
        if not message.conversation_id:
            raise HTTPException(status_code=400, detail="conversation_id is required")
        if not message.role:
            raise HTTPException(status_code=400, detail="role is required")
        if not message.content:
            raise HTTPException(status_code=400, detail="content is required")

        # Kiểm tra conversation tồn tại
        conversation_service = ConversationService(session)
        conversation = conversation_service.get_conversation(message.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation with ID {message.conversation_id} not found")

        message_service = MessageService(session)
        message_id = message_service.add_message(message)
        created_message = message_service.get_message(message_id)

        return created_message
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in send_message: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in send_message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
