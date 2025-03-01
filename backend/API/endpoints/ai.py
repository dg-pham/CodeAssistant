from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session

from backend.db.base import get_session
from backend.ai import process_code_request
from backend.schemas.code_request import CodeRequest
from backend.schemas.code_response import CodeResponse

router = APIRouter()

@router.post("/code/generate", response_model=CodeResponse)
async def generate_code(request_data: CodeRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Tạo mã dựa trên mô tả đầu vào"""
    if request_data.action != "generate":
        request_data.action = "generate"
    return await process_code_request("generate", request_data, background_tasks, session)

@router.post("/code/optimize", response_model=CodeResponse)
async def optimize_code(request_data: CodeRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Tối ưu hóa mã hiện có"""
    if request_data.action != "optimize":
        request_data.action = "optimize"
    return await process_code_request("optimize", request_data, background_tasks, session)

@router.post("/code/translate", response_model=CodeResponse)
async def translate_code(request_data: CodeRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Dịch mã từ ngôn ngữ nguồn sang ngôn ngữ đích"""
    if request_data.action != "translate":
        request_data.action = "translate"
    return await process_code_request("translate", request_data, background_tasks, session)

@router.post("/code/explain", response_model=CodeResponse)
async def explain_code(request_data: CodeRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Giải thích chi tiết mã"""
    if request_data.action != "explain":
        request_data.action = "explain"
    return await process_code_request("explain", request_data, background_tasks, session)

@router.post("/code", response_model=CodeResponse)
async def process_code(request_data: CodeRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Xử lý yêu cầu mã dựa trên hành động được chỉ định"""
    if request_data.action not in ["generate", "optimize", "translate", "explain"]:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {request_data.action}")

    return await process_code_request(request_data.action, request_data, background_tasks, session)