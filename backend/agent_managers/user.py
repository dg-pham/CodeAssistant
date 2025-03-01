import uuid

from backend.db import get_db_connection
from backend.models import User


class UserManager:
    def __init__(self):
        pass

    def create_user(self, user: User) -> str:
        """Tạo người dùng mới hoặc lấy người dùng hiện có"""
        with get_db_connection() as conn:
            cursor = conn.cursor()

            user_id = user.id or str(uuid.uuid4())

            # Kiểm tra xem người dùng đã tồn tại chưa
            if user.id:
                cursor.execute("SELECT id FROM users WHERE id = ?", (user.id,))
                if cursor.fetchone():
                    return user_id

            # Tạo người dùng mới
            cursor.execute(
                "INSERT INTO users (id, name) VALUES (?, ?)",
                (user_id, user.name)
            )

            conn.commit()
            return user_id