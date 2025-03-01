import re
import uuid
from typing import Optional, Tuple, List, Dict

import openai
from fastapi import HTTPException, BackgroundTasks, Depends
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.LLM_Bundle.Azure_LLM import AzureOpenAIConfig
from backend.agent_managers.pattern import PatternExtractor
from backend.db.base import get_session
from backend.db.models.code_snippet import CodeSnippet
from backend.db.models.conversation import Conversation
from backend.db.models.message import Message
from backend.db.models.user import User
from backend.db.services.code_snippet import CodeSnippetService
from backend.db.services.conversation import ConversationService
from backend.db.services.memory import AgentMemoryService
from backend.db.services.message import MessageService
from backend.db.services.user import UserService
from backend.log import logger
from backend.models import CodeResponse, CodeRequest
from backend.prompts import SYSTEM_PROMPTS

config = AzureOpenAIConfig()
pattern_extractor = PatternExtractor()

client = openai.AzureOpenAI(
    api_key=config.api_key,
    api_version=config.api_version,
    azure_endpoint=config.endpoint
)


async def get_or_create_user(user: User = None, session: Session = Depends(get_session)):
    """Tạo hoặc lấy người dùng hiện có"""
    user_service = UserService(session)

    if not user:
        # Tạo người dùng ẩn danh nếu không có
        user = User(name="Anonymous User")

    user_id = user_service.create_user(user)
    return user_id


# Xử lý và làm giàu prompt với bộ nhớ và lịch sử
async def enrich_prompt_with_context(system_prompt: str, user_prompt: str, user_id: str,
                                     session: Session,
                                     conversation_id: Optional[str] = None,
                                     context: Optional[str] = None) -> Tuple[str, List[Dict]]:
    """Làm giàu prompt với bộ nhớ và lịch sử cuộc hội thoại"""
    memory_service = AgentMemoryService(session)
    message_service = MessageService(session)

    enriched_system_prompt = system_prompt
    messages_for_completion = []

    # Lấy bộ nhớ liên quan
    memories = memory_service.retrieve_memories(user_id, context)
    if memories:
        memory_text = "\n\nUser preferences and important context:\n"
        for memory in memories:
            memory_text += f"- {memory.key}: {memory.value}\n"

        enriched_system_prompt += memory_text

    # Lấy lịch sử cuộc hội thoại gần đây nếu có
    conversation_history = []
    if conversation_id:
        conversation_history = message_service.get_conversation_messages(conversation_id, limit=5)

    # Xây dựng danh sách tin nhắn cho API completion
    messages_for_completion.append({"role": "system", "content": enriched_system_prompt})

    # Thêm lịch sử cuộc hội thoại
    for message in reversed(conversation_history):  # Đảo ngược để có thứ tự thời gian đúng
        messages_for_completion.append({
            "role": message.role,
            "content": message.content
        })

    # Thêm prompt hiện tại của người dùng
    messages_for_completion.append({"role": "user", "content": user_prompt})

    return enriched_system_prompt, messages_for_completion


# Tạo đề xuất dựa trên lịch sử và mẫu
async def generate_suggestions(user_id: str, conversation_id: str, action: str, session: Session) -> List[str]:
    """Tạo các đề xuất thông minh dựa trên lịch sử và bộ nhớ"""
    message_service = MessageService(session)
    snippet_service = CodeSnippetService(session)

    suggestions = []

    try:
        # Lấy lịch sử cuộc hội thoại
        conversation_history = message_service.get_conversation_messages(conversation_id, limit=5)
        history_text = "\n".join([f"{msg.role}: {msg.content}" for msg in conversation_history])

        # Lấy code snippets của người dùng
        user_snippets = snippet_service.get_user_snippets(user_id)
        snippets_text = ""
        if user_snippets:
            snippets_text = "Recent code snippets:\n" + "\n".join([
                f"- {s.language}: {s.description or 'Unnamed snippet'}"
                for s in user_snippets
            ])

        # Sử dụng AI để tạo đề xuất
        response = client.chat.completions.create(
            model=config.deployment_name,
            messages=[
                {"role": "system",
                 "content": f"You are a helpful coding assistant. Based on the conversation history and user's past activities, suggest 3 relevant {action}-related next steps or questions the user might want to explore."},
                {"role": "user",
                 "content": f"Conversation history:\n{history_text}\n\n{snippets_text}\n\nGenerate 3 relevant, specific suggestions related to {action} that might help the user."}
            ],
            temperature=0
        )

        suggestion_text = response.choices[0].message.content

        # Phân tích và lọc ra các đề xuất
        for line in suggestion_text.split("\n"):
            line = line.strip()
            if line and (line.startswith("-") or line.startswith("*") or re.match(r"^\d+\.", line)):
                # Xóa ký tự đầu dòng và làm sạch
                clean_suggestion = re.sub(r"^[-*\d\.]+\s*", "", line).strip()
                if clean_suggestion:
                    suggestions.append(clean_suggestion)

        # Giới hạn số lượng đề xuất
        return suggestions[:3]
    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
        return []


# Xử lý các yêu cầu code
async def process_code_request(action: str, request_data: CodeRequest,
                               background_tasks: BackgroundTasks,
                               session: Session = Depends(get_session)) -> CodeResponse:
    """Xử lý yêu cầu code dựa trên hành động được chỉ định"""
    try:
        user_service = UserService(session)
        conversation_service = ConversationService(session)
        message_service = MessageService(session)
        snippet_service = CodeSnippetService(session)

        # Đảm bảo user_id tồn tại
        user_id = request_data.user_id or str(uuid.uuid4())
        if user_id:
            user = user_service.get_user(user_id)
            if not user:
                # Nếu user_id được cung cấp nhưng không tồn tại
                if request_data.user_id:  # Chỉ báo lỗi nếu user_id được cung cấp
                    raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
                # Tạo user mới nếu không có user_id được cung cấp
                user = User(id=user_id, name="Anonymous User")
                user_service.create_user(user)

        # Kiểm tra các điều kiện cần thiết dựa trên action
        if action == "generate" and not request_data.description:
            raise HTTPException(status_code=400, detail="Description is required for code generation")
        elif action == "optimize" and not request_data.code:
            raise HTTPException(status_code=400, detail="Code is required for optimization")
        elif action == "translate" and (not request_data.code or not request_data.language_from or not request_data.language_to):
            raise HTTPException(status_code=400, detail="Code, source language, and target language are required for translation")
        elif action == "explain" and not request_data.code:
            raise HTTPException(status_code=400, detail="Code is required for explanation")

        conversation_id = request_data.conversation_id
        if conversation_id:
            # Kiểm tra xem conversation có tồn tại không
            existing_conversation = conversation_service.get_conversation(conversation_id)
            if not existing_conversation:
                # Hoặc tạo mới với ID được cung cấp hoặc báo lỗi
                raise HTTPException(status_code=404, detail=f"Conversation with ID {conversation_id} not found")
        else:
            # Tạo conversation mới nếu không có ID
            conversation = Conversation(
                user_id=user_id,
                title=f"New {action.title()} Conversation"
            )
            conversation_id = conversation_service.create_conversation(conversation)

        # Lấy system prompt tương ứng
        system_prompt = SYSTEM_PROMPTS.get(action, SYSTEM_PROMPTS["general"])

        # Xây dựng user prompt dựa trên hành động và dữ liệu yêu cầu
        user_prompt = ""
        context = None

        if action == "generate":
            user_prompt = f"""Generate {request_data.language_to} code for the following description:

            Description: {request_data.description}

            {'Include detailed comments' if request_data.comments else 'Minimize comments'}
            """
            context = f"code_generation_{request_data.language_to}"

        elif action == "optimize":
            user_prompt = f"""Optimize the following code with optimization level: {request_data.optimization_level}

            ```
            {request_data.code}
            ```

            Explain the key optimizations you made.
            """
            context = f"code_optimization_{request_data.language_from or 'unknown'}"

            # Học từ mã của người dùng
            if request_data.language_from:
                background_tasks.add_task(
                    pattern_extractor.extract_code_preferences,
                    request_data.code,
                    request_data.language_from,
                    user_id,
                    background_tasks
                )

        elif action == "translate":
            user_prompt = f"""Translate the following code from {request_data.language_from} to {request_data.language_to}:

            ```{request_data.language_from}
            {request_data.code}
            ```

            Use idiomatic {request_data.language_to} patterns and conventions.
            """
            context = f"code_translation_{request_data.language_from}_to_{request_data.language_to}"

            # Học từ mã của người dùng
            background_tasks.add_task(
                pattern_extractor.extract_code_preferences,
                request_data.code,
                request_data.language_from,
                user_id,
                background_tasks
            )

        elif action == "explain":
            language_info = f"Language: {request_data.language_from}" if request_data.language_from else ""

            user_prompt = f"""Explain the following code in detail:

            {language_info}

            ```
            {request_data.code}
            ```

            Provide a comprehensive explanation including the purpose, logic, and any important patterns or algorithms used.
            """
            context = f"code_explanation_{request_data.language_from or 'unknown'}"

        # Làm giàu prompt với ngữ cảnh
        try:
            enriched_system_prompt, messages_for_completion = await enrich_prompt_with_context(
                system_prompt,
                user_prompt,
                user_id,
                session,
                conversation_id,
                context
            )
        except Exception as e:
            logger.error(f"Error enriching prompt: {str(e)}")
            # Fallback to basic prompts if context enrichment fails
            messages_for_completion = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

        # Lưu tin nhắn của người dùng vào lịch sử
        try:
            user_message = Message(
                role="user",
                content=user_prompt,
                conversation_id=conversation_id
            )
            message_service.add_message(user_message)
        except Exception as e:
            logger.error(f"Error saving user message: {str(e)}")
            # Continue even if saving fails - this is non-critical

        # Gọi Azure OpenAI API
        try:
            response = client.chat.completions.create(
                model=config.deployment_name,
                messages=messages_for_completion,
                temperature=0
            )

            result = response.choices[0].message.content
            token_usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")
        except Exception as e:
            logger.error(f"Error calling Azure OpenAI API: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

        # Lưu trữ câu trả lời vào lịch sử
        try:
            assistant_message = Message(
                role="assistant",
                content=result,
                conversation_id=conversation_id
            )
            message_id = message_service.add_message(assistant_message)
        except Exception as e:
            logger.error(f"Error saving assistant message: {str(e)}")
            # Create a temporary ID if saving fails
            message_id = str(uuid.uuid4())

        # Lưu mã nguồn nếu được yêu cầu và là kết quả của generate hoặc translate
        if request_data.save_snippet and (action == "generate" or action == "translate"):
            try:
                # Trích xuất mã từ kết quả
                code_blocks = re.findall(r"```(?:\w+)?\n([\s\S]+?)\n```", result)
                if code_blocks:
                    code_to_save = code_blocks[0]
                    language = request_data.language_to or "unknown"

                    snippet = CodeSnippet(
                        user_id=user_id,
                        language=language,
                        code=code_to_save,
                        description=request_data.description or f"Result of {action} operation",
                        tags=request_data.tags or []
                    )

                    snippet_service.save_snippet(snippet)
            except Exception as e:
                logger.error(f"Error saving code snippet: {str(e)}")
                # Continue even if snippet saving fails

        # Tạo đề xuất cho người dùng
        try:
            suggestions = await generate_suggestions(user_id, conversation_id, action, session)
        except Exception as e:
            logger.error(f"Error generating suggestions: {str(e)}")
            suggestions = []

        return CodeResponse(
            status="success",
            result=result,
            conversation_id=conversation_id,
            message_id=message_id,
            additional_info={"token_usage": token_usage},
            suggestions=suggestions
        )

    except HTTPException:
        # Re-raise HTTP exceptions to preserve their status codes and details
        raise
    except ValueError as e:
        logger.error(f"Validation error in process_code_request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except SQLAlchemyError as e:
        logger.error(f"Database error in process_code_request: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in process_code_request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")