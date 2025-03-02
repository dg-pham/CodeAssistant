import argparse

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.API.exception_handler import (
    http_exception_handler,
    sqlalchemy_exception_handler,
    value_error_handler,
    global_exception_handler
)
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
from backend.API.router import router
from backend.db.base import init_database
from backend.log import logger

init_database()

app = FastAPI(
    title='Code Agent',
    version='0',
    description="Code Assistant API with AI features and project management",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(ValueError, value_error_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.include_router(
    router,
    prefix="/api/v1",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Intelligent Code Agent API")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to run the server on")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")

    args = parser.parse_args()

    logger.info(f"Starting Intelligent Code Agent API on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)
