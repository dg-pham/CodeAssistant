from fastapi import Request
from fastapi.responses import JSONResponse

from backend.log import logger


async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": f"An unexpected error occurred: {str(exc)}"}
    )