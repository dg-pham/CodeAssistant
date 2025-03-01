from typing import Generic, TypeVar, List, Optional, Dict, Any
from pydantic import BaseModel, Field

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number, starting from 1")
    size: int = Field(20, ge=1, le=100, description="Items per page")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

class SuccessResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None