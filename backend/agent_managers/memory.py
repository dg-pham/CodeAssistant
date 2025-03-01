import uuid
from typing import Optional, List, Dict

from backend.db import get_db_connection
from backend.models import Memory


class AgentMemoryManager:
    def __init__(self):
        pass

    def store_memory(self, memory: Memory):
        """Lưu trữ một mục nhớ mới hoặc cập nhật mục nhớ hiện có"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Kiểm tra xem mục nhớ đã tồn tại chưa
            cursor.execute(
                "SELECT id FROM agent_memory WHERE user_id = ? AND key = ?",
                (memory.user_id, memory.key)
            )
            existing = cursor.fetchone()

            if existing:
                # Cập nhật mục nhớ hiện có
                cursor.execute(
                    """
                    UPDATE agent_memory 
                    SET value = ?, context = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND key = ?
                    """,
                    (memory.value, memory.context, memory.priority, memory.user_id, memory.key)
                )
            else:
                # Tạo mục nhớ mới
                memory_id = str(uuid.uuid4())
                cursor.execute(
                    """
                    INSERT INTO agent_memory (id, user_id, key, value, context, priority)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (memory_id, memory.user_id, memory.key, memory.value, memory.context, memory.priority)
                )

            conn.commit()

    def retrieve_memories(self, user_id: str, context: Optional[str] = None, limit: int = 5) -> List[Dict]:
        """Lấy các mục nhớ liên quan cho người dùng"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            if context:
                # Lấy các mục nhớ phù hợp với ngữ cảnh
                cursor.execute(
                    """
                    SELECT key, value, context, priority
                    FROM agent_memory
                    WHERE user_id = ? AND context LIKE ?
                    ORDER BY priority DESC, updated_at DESC
                    LIMIT ?
                    """,
                    (user_id, f"%{context}%", limit)
                )
            else:
                # Lấy các mục nhớ quan trọng nhất
                cursor.execute(
                    """
                    SELECT key, value, context, priority
                    FROM agent_memory
                    WHERE user_id = ?
                    ORDER BY priority DESC, updated_at DESC
                    LIMIT ?
                    """,
                    (user_id, limit)
                )

            return [dict(row) for row in cursor.fetchall()]

    def forget_memory(self, user_id: str, key: str):
        """Xóa một mục nhớ"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM agent_memory WHERE user_id = ? AND key = ?",
                (user_id, key)
            )
            conn.commit()
