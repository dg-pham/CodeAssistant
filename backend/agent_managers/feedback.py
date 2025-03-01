import uuid

import openai
from fastapi import BackgroundTasks

from backend.LLM_Bundle.Azure_LLM import AzureOpenAIConfig
from backend.db.models.memory import AgentMemory
from backend.db.models.feedback import Feedback
from backend.log import logger

config = AzureOpenAIConfig()


class FeedbackManager:
    def __init__(self):
        pass

    def process_feedback_for_learning(self, feedback: Feedback, background_tasks: BackgroundTasks):
        """Xử lý phản hồi để học hỏi"""
        # Lấy message và ngữ cảnh
        from backend.db.base import engine
        from sqlmodel import Session, select
        from backend.db.models.message import Message
        from backend.db.models.conversation import Conversation

        with Session(engine) as session:
            # Lấy message từ database
            message_query = select(Message, Conversation).join(Conversation).where(Message.id == feedback.message_id)
            result = session.exec(message_query).first()

            if not result:
                return

            message, conversation = result
            content = message.content
            conversation_id = conversation.id
            user_id = conversation.user_id

            # Phân tích phản hồi
            if feedback.rating >= 4:  # Phản hồi tích cực
                # Lưu trữ các thông tin tích cực vào bộ nhớ
                if len(content) > 200:
                    content_summary = content[:200] + "..."
                else:
                    content_summary = content

                background_tasks.add_task(
                    self._extract_and_store_positive_patterns,
                    content,
                    user_id,
                    conversation_id,
                    feedback.rating
                )
            elif feedback.rating <= 2:  # Phản hồi tiêu cực
                # Lưu trữ các thông tin tiêu cực vào bộ nhớ
                background_tasks.add_task(
                    self._extract_and_store_negative_patterns,
                    content,
                    user_id,
                    conversation_id,
                    feedback.comment or "",
                    feedback.rating
                )

    async def _extract_and_store_positive_patterns(self, content: str, user_id: str, conversation_id: str, rating: int):
        """Trích xuất và lưu trữ các mẫu tích cực từ phản hồi"""
        try:
            # Trích xuất các điểm tích cực bằng AI
            response = openai.ChatCompletion.create(
                deployment_id=config.deployment_name,
                messages=[
                    {"role": "system",
                     "content": "Identify what made this response helpful. Extract coding style preferences, explanation depth preferences, and other patterns that should be remembered for future interactions."},
                    {"role": "user",
                     "content": f"Response: {content}\n\nPlease identify 2-3 key positive patterns from this response that received a {rating}/5 rating."}
                ],
                temperature=0.3,
                max_tokens=300
            )

            patterns = response.choices[0].message.content

            # Phân tích các mẫu và lưu trữ vào bộ nhớ
            from backend.db.base import engine
            from sqlmodel import Session
            from backend.db.services.memory import AgentMemoryService

            with Session(engine) as session:
                memory_service = AgentMemoryService(session)

                pattern_lines = [p.strip() for p in patterns.split("\n") if p.strip()]
                for i, pattern in enumerate(pattern_lines):
                    if ":" in pattern:
                        key, value = pattern.split(":", 1)
                        key = key.strip()
                        value = value.strip()

                        memory = AgentMemory(
                            user_id=user_id,
                            key=f"positive_pattern_{i}_{key}",
                            value=value,
                            context="code_style",
                            priority=min(0.5 + (rating - 3) * 0.1, 0.9)  # Tăng ưu tiên theo rating
                        )
                        memory_service.store_memory(memory)
        except Exception as e:
            logger.error(f"Error processing positive feedback: {str(e)}")

    async def _extract_and_store_negative_patterns(self, content: str, user_id: str, conversation_id: str, comment: str,
                                                   rating: int):
        """Trích xuất và lưu trữ các mẫu tiêu cực từ phản hồi"""
        try:
            # Trích xuất các điểm tiêu cực bằng AI
            response = openai.ChatCompletion.create(
                deployment_id=config.deployment_name,
                messages=[
                    {"role": "system",
                     "content": "Identify what could be improved in this response. Extract issues with coding style, explanation clarity, or other patterns that should be corrected in future interactions."},
                    {"role": "user",
                     "content": f"Response: {content}\n\nUser comment: {comment}\n\nPlease identify 2-3 key issues from this response that received a {rating}/5 rating."}
                ],
                temperature=0.3,
                max_tokens=300
            )

            issues = response.choices[0].message.content

            # Phân tích các vấn đề và lưu trữ vào bộ nhớ
            from backend.db.base import engine
            from sqlmodel import Session
            from backend.db.services.memory import AgentMemoryService

            with Session(engine) as session:
                memory_service = AgentMemoryService(session)

                issue_lines = [i.strip() for i in issues.split("\n") if i.strip()]
                for i, issue in enumerate(issue_lines):
                    if ":" in issue:
                        key, value = issue.split(":", 1)
                        key = key.strip()
                        value = value.strip()

                        memory = AgentMemory(
                            user_id=user_id,
                            key=f"negative_pattern_{i}_{key}",
                            value=value,
                            context="code_style_avoid",
                            priority=min(0.5 + (3 - rating) * 0.1, 0.9)  # Tăng ưu tiên theo mức độ tiêu cực
                        )
                        memory_service.store_memory(memory)
        except Exception as e:
            logger.error(f"Error processing negative feedback: {str(e)}")