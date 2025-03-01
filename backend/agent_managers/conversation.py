import uuid
from typing import Optional, List, Dict

from backend.db import get_db_connection
from backend.models import Message, Conversation


class ConversationManager:
    def __init__(self):
        pass

    def create_conversation(self, conversation: Conversation) -> str:
        """Tạo một cuộc hội thoại mới"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            conversation_id = conversation.id or str(uuid.uuid4())

            cursor.execute(
                """
                INSERT INTO conversations (id, user_id, title)
                VALUES (?, ?, ?)
                """,
                (conversation_id, conversation.user_id, conversation.title)
            )

            conn.commit()
            return conversation_id

    def add_message(self, message: Message) -> str:
        """Thêm tin nhắn vào cuộc hội thoại"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            message_id = str(uuid.uuid4())

            cursor.execute(
                """
                INSERT INTO messages (id, conversation_id, role, content)
                VALUES (?, ?, ?, ?)
                """,
                (message_id, message.conversation_id, message.role, message.content)
            )

            # Cập nhật thời gian cập nhật của cuộc hội thoại
            cursor.execute(
                """
                UPDATE conversations
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (message.conversation_id,)
            )

            conn.commit()
            return message_id

    def get_conversation_history(self, conversation_id: str, limit: int = 10) -> List[Dict]:
        """Lấy lịch sử cuộc hội thoại"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT id, role, content, timestamp
                FROM messages
                WHERE conversation_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (conversation_id, limit)
            )

            return [dict(row) for row in cursor.fetchall()]

    def get_conversation_user(self, conversation_id: str) -> Optional[str]:
        """Lấy user_id của cuộc hội thoại"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                "SELECT user_id FROM conversations WHERE id = ?",
                (conversation_id,)
            )

            result = cursor.fetchone()
            return result['user_id'] if result else None
