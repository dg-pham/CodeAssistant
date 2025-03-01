from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.conversation import Conversation
from backend.db.services.conversation import ConversationService
from backend.db.services.message import MessageService
from backend.schemas.conversation import ConversationCreate, ConversationResponse, ConversationWithMessagesResponse, \
    ConversationUpdate
from backend.schemas.message import MessageResponse

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(conversation: ConversationCreate, session: Session = Depends(get_session)):
    """Tạo cuộc hội thoại mới"""
    try:
        conversation_service = ConversationService(session)

        # Chuyển đổi từ schema sang model
        conversation_model = Conversation(
            user_id=conversation.user_id,
            title=conversation.title
        )
        if conversation.id:
            conversation_model.id = conversation.id

        conversation_id = conversation_service.create_conversation(conversation_model)
        created_conversation = conversation_service.get_conversation(conversation_id)

        if not created_conversation:
            raise HTTPException(status_code=500, detail="Failed to create conversation")

        return created_conversation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")



@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, session: Session = Depends(get_session)):
    """Lấy thông tin cuộc hội thoại"""
    try:
        conversation_service = ConversationService(session)
        conversation = conversation_service.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")


@router.get("/users/{user_id}/conversations", response_model=List[ConversationResponse])
async def get_user_conversations(user_id: str, session: Session = Depends(get_session)):
    """Lấy danh sách cuộc hội thoại của người dùng"""
    try:
        # Kiểm tra user tồn tại
        from backend.db.services.user import UserService
        user_service = UserService(session)
        user = user_service.get_user(user_id)

        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        conversation_service = ConversationService(session)
        conversations = conversation_service.get_user_conversations(user_id)
        return conversations
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversations: {str(e)}")


@router.get("/conversations/{conversation_id}/history", response_model=List[MessageResponse])
async def get_conversation_history(conversation_id: str, limit: int = 10, session: Session = Depends(get_session)):
    """Lấy lịch sử cuộc hội thoại"""
    try:
        message_service = MessageService(session)
        history = message_service.get_conversation_messages(conversation_id, limit)
        return history
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation history: {str(e)}")


@router.get("/conversations/{conversation_id}/with-messages", response_model=ConversationWithMessagesResponse)
async def get_conversation_with_messages(conversation_id: str, limit: int = 10,
                                         session: Session = Depends(get_session)):
    """Lấy thông tin cuộc hội thoại kèm tin nhắn"""
    try:
        conversation_service = ConversationService(session)
        message_service = MessageService(session)

        conversation = conversation_service.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = message_service.get_conversation_messages(conversation_id, limit)

        # Chuyển đổi sang schema response với messages
        response = ConversationWithMessagesResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            title=conversation.title,
            messages=messages
        )

        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation with messages: {str(e)}")


@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
        conversation_id: str,
        update_data: ConversationUpdate,  # Tạo schema mới cho dữ liệu cập nhật
        session: Session = Depends(get_session)
):
    """Cập nhật thông tin cuộc hội thoại"""
    try:
        conversation_service = ConversationService(session)

        # Kiểm tra conversation có tồn tại không
        existing_conversation = conversation_service.get_conversation(conversation_id)
        if not existing_conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Chuyển đổi từ schema sang dict
        update_dict = update_data.dict(exclude_unset=True)

        # Cập nhật cuộc hội thoại
        updated_conversation = conversation_service.update_conversation(
            conversation_id,
            **update_dict
        )

        if not updated_conversation:
            raise HTTPException(status_code=500, detail="Failed to update conversation")

        return updated_conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating conversation: {str(e)}")