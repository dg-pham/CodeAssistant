from datetime import datetime

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """Endpoint kiểm tra trạng thái"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}