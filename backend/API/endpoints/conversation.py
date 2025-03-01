from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.conversation import Conversation
from backend.db.services.conversation import ConversationService
from backend.db.services.message import MessageService
from backend.schemas.conversation import ConversationCreate, ConversationResponse, ConversationWithMessagesResponse
from backend.schemas.message import MessageResponse

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(conversation: ConversationCreate, session: Session = Depends(get_session)):
    """Tạo cuộc hội thoại mới"""
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


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, session: Session = Depends(get_session)):
    """Lấy thông tin cuộc hội thoại"""
    conversation_service = ConversationService(session)
    conversation = conversation_service.get_conversation(conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


@router.get("/users/{user_id}/conversations", response_model=List[ConversationResponse])
async def get_user_conversations(user_id: str, session: Session = Depends(get_session)):
    """Lấy danh sách cuộc hội thoại của người dùng"""
    conversation_service = ConversationService(session)
    conversations = conversation_service.get_user_conversations(user_id)
    return conversations


@router.get("/conversations/{conversation_id}/history", response_model=List[MessageResponse])
async def get_conversation_history(conversation_id: str, limit: int = 10, session: Session = Depends(get_session)):
    """Lấy lịch sử cuộc hội thoại"""
    message_service = MessageService(session)
    history = message_service.get_conversation_messages(conversation_id, limit)
    return history


@router.get("/conversations/{conversation_id}/with-messages", response_model=ConversationWithMessagesResponse)
async def get_conversation_with_messages(conversation_id: str, limit: int = 10,
                                         session: Session = Depends(get_session)):
    """Lấy thông tin cuộc hội thoại kèm tin nhắn"""
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


@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(conversation_id: str, title: str, session: Session = Depends(get_session)):
    """Cập nhật tiêu đề cuộc hội thoại"""
    conversation_service = ConversationService(session)
    conversation = conversation_service.upda