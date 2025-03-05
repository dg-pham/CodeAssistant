from fastapi import APIRouter

from backend.API import health
from backend.API.endpoints import ai, conversation, feedback, user, code_snippet, memory, git_merge, \
    agent_orchestration, workflow, message

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
    message.router,
    tags=['Message']
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
    git_merge.router,
    tags=['Git Merge']
)

router.include_router(
    agent_orchestration.router,
    tags=['Agent Orchestration']
)

router.include_router(
    workflow.router,
    tags=['Workflow']
)

router.include_router(
    health.router,
    tags=['Health']
)