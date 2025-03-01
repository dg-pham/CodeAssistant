import functools
from sqlmodel import Session
from backend.log import logger

def db_transaction(func):
    """Decorator để quản lý transaction và exception trong các hàm service"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Giả sử self là tham số đầu tiên và có thuộc tính session
        self = args[0]
        try:
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            if hasattr(self, 'session') and isinstance(self.session, Session):
                self.session.rollback()
            logger.error(f"Error in {func.__name__}: {str(e)}")
            raise
    return wrapper