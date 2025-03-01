from fastapi import APIRouter

from backend.API import health
from backend.API.endpoints import ai, conversation, feedback, user, code_snippet, memory

router = APIRouter()

router.include_router(
    user.router,
    tags=['User']
)

router.include_router(
    conversation.router,
    tags=['Conversation']
)

router.include_router(
    ai.router,
    tags=['AI']
)

router.include_router(
    code_snippet.router,
    tags=['Code Snippet']
)

router.include_router(
    feedback.router,
    tags=['Feedback']
)

router.include_router(
    memory.router,
    tags=['Memory']
)

router.include_router(
    health.router,
    tags=['Health']
)