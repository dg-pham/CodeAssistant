from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.user import User
from backend.db.services.user import UserService
from backend.log import logger
from backend.schemas.user import UserCreate, UserResponse

router = APIRouter()


@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, session: Session = Depends(get_session)):
    """Tạo người dùng mới"""
    try:
        if not user.name:
            raise ValueError("User name is required")

        user_service = UserService(session)

        # Chuyển đổi từ schema sang model
        user_model = User(name=user.name)
        if user.id:
            user_model.id = user.id

        user_id = user_service.create_user(user_model)
        created_user = user_service.get_user(user_id)

        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to create user")

        return created_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except SQLAlchemyError as e:
        logger.error(f"Database error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, session: Session = Depends(get_session)):
    """Lấy thông tin người dùng"""
    try:
        user_service = UserService(session)
        user = user_service.get_user(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user: {str(e)}")