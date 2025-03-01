import uuid
from typing import Optional, List
from sqlmodel import Session, select

from backend.db.models.user import User


class UserService:
    def __init__(self, session: Session):
        self.session = session

    def create_user(self, user: User) -> str:
        """Tạo người dùng mới hoặc lấy người dùng hiện có"""
        user_id = user.id or str(uuid.uuid4())

        # Kiểm tra xem người dùng đã tồn tại chưa
        if user.id:
            existing_user = self.get_user(user.id)
            if existing_user:
                return user.id

        # Gán ID nếu chưa có
        user.id = user_id

        # Lưu vào database
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return user.id

    def get_user(self, user_id: str) -> Optional[User]:
        """Lấy thông tin người dùng theo ID"""
        return self.session.exec(
            select(User).where(User.id == user_id)
        ).first()

    def get_users(self) -> List[User]:
        """Lấy danh sách tất cả người dùng"""
        return self.session.exec(select(User)).all()