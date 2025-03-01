# backend/schemas/__init__.py
from typing import TYPE_CHECKING, List

from backend.schemas.user import UserCreate, UserResponse
from backend.schemas.message import MessageCreate, MessageResponse
from backend.schemas.feedback import FeedbackCreate, FeedbackResponse
from backend.schemas.code_request import CodeRequest
from backend.schemas.code_response import CodeResponse
from backend.schemas.code_snippet import CodeSnippetCreate, CodeSnippetResponse
from backend.schemas.memory import MemoryCreate, MemoryResponse
from backend.schemas.common import (
    PaginationParams, PaginatedResponse,
    SuccessResponse, ErrorResponse
)

# Riêng phần này cần xử lý cẩn thận vì có tham chiếu vòng tròn
from backend.schemas.conversation import (
    ConversationBase, ConversationCreate,
    ConversationResponse
)

# Cập nhật tham chiếu cho ConversationWithMessagesResponse
if TYPE_CHECKING:
    from backend.schemas.conversation import ConversationWithMessagesResponse