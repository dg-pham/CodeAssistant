from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.db.base import get_session
from backend.db.models.code_snippet import CodeSnippet
from backend.db.services.code_snippet import CodeSnippetService
from backend.schemas.code_snippet import CodeSnippetCreate, CodeSnippetResponse

router = APIRouter()


@router.post("/code-snippets", response_model=CodeSnippetResponse)
async def save_code_snippet(snippet: CodeSnippetCreate, session: Session = Depends(get_session)):
    """Lưu đoạn mã"""
    snippet_service = CodeSnippetService(session)

    # Chuyển đổi từ schema sang model
    snippet_model = CodeSnippet(
        user_id=snippet.user_id,
        language=snippet.language,
        code=snippet.code,
        description=snippet.description,
        tags=snippet.tags
    )
    if snippet.id:
        snippet_model.id = snippet.id

    snippet_id = snippet_service.save_snippet(snippet_model)
    created_snippet = snippet_service.get_snippet(snippet_id)

    if not created_snippet:
        raise HTTPException(status_code=500, detail="Failed to create code snippet")

    return created_snippet


@router.get("/code-snippets/{snippet_id}", response_model=CodeSnippetResponse)
async def get_snippet(snippet_id: str, session: Session = Depends(get_session)):
    """Lấy thông tin đoạn mã"""
    snippet_service = CodeSnippetService(session)
    snippet = snippet_service.get_snippet(snippet_id)

    if not snippet:
        raise HTTPException(status_code=404, detail="Code snippet not found")

    return snippet


@router.get("/users/{user_id}/code-snippets", response_model=List[CodeSnippetResponse])
async def get_user_snippets(user_id: str, language: Optional[str] = None, session: Session = Depends(get_session)):
    """Lấy danh sách đoạn mã của người dùng"""
    snippet_service = CodeSnippetService(session)
    snippets = snippet_service.get_user_snippets(user_id, language)
    return snippets


@router.put("/code-snippets/{snippet_id}", response_model=CodeSnippetResponse)
async def update_snippet(snippet_id: str, snippet_update: CodeSnippetCreate, session: Session = Depends(get_session)):
    """Cập nhật đoạn mã"""
    snippet_service = CodeSnippetService(session)

    # Chỉ lấy các trường cần cập nhật
    update_data = snippet_update.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    snippet = snippet_service.update_snippet(snippet_id, **update_data)
    if not snippet:
        raise HTTPException(status_code=404, detail="Code snippet not found")

    return snippet


@router.delete("/code-snippets/{snippet_id}", response_model=dict)
async def delete_snippet(snippet_id: str, session: Session = Depends(get_session)):
    """Xóa đoạn mã"""
    snippet_service = CodeSnippetService(session)
    success = snippet_service.delete_snippet(snippet_id)

    if not success:
        raise HTTPException(status_code=404, detail="Code snippet not found")

    return {"success": True}


@router.get("/users/{user_id}/code-snippets/search", response_model=List[CodeSnippetResponse])
async def search_snippets(user_id: str, query: str, session: Session = Depends(get_session)):
    """Tìm kiếm đoạn mã"""
    snippet_service = CodeSnippetService(session)
    snippets = snippet_service.search_snippets(user_id, query)
    return snippets