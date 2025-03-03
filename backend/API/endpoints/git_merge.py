from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.db.base import get_session
from backend.db.models.git_merge import GitMergeSession, GitMergeConflict
from backend.db.services.git_merge import GitMergeService
from backend.db.services.user import UserService
from backend.agent_managers.git_merge import GitMergeAgent
from backend.schemas.git_merge import (
    GitMergeSessionCreate, GitMergeSessionResponse,
    GitMergeConflictResponse, AnalyzeConflictRequest,
    ResolveConflictRequest, CompleteMergeRequest
)
from backend.log import logger

router = APIRouter()
git_merge_agent = GitMergeAgent()


@router.post("/git-merge/sessions", response_model=GitMergeSessionResponse)
async def create_merge_session(
        session_data: GitMergeSessionCreate,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session)
):
    """Tạo phiên merge git mới"""
    try:
        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(session_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {session_data.user_id} not found")

        # Bắt đầu phiên merge git
        session_id = await git_merge_agent.start_merge_session(
            session_data.user_id,
            session_data.repository_url,
            session_data.base_branch,
            session_data.target_branch,
            background_tasks,
            session
        )

        # Lấy thông tin phiên đã tạo
        merge_service = GitMergeService(session)
        created_session = merge_service.get_session(session_id)

        if not created_session:
            raise HTTPException(status_code=500, detail="Failed to create merge session")

        return created_session

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in create_merge_session: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in create_merge_session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/git-merge/sessions/{session_id}", response_model=GitMergeSessionResponse)
async def get_merge_session(
        session_id: str,
        session: Session = Depends(get_session)
):
    """Lấy thông tin phiên merge git"""
    try:
        merge_service = GitMergeService(session)
        merge_session = merge_service.get_session(session_id)

        if not merge_session:
            raise HTTPException(status_code=404, detail="Merge session not found")

        return merge_session

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_merge_session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/users/{user_id}/git-merge/sessions", response_model=List[GitMergeSessionResponse])
async def get_user_merge_sessions(
        user_id: str,
        session: Session = Depends(get_session)
):
    """Lấy danh sách phiên merge git của người dùng"""
    try:
        # Kiểm tra user tồn tại
        user_service = UserService(session)
        user = user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")

        merge_service = GitMergeService(session)
        sessions = merge_service.get_user_sessions(user_id)

        return sessions

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_user_merge_sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/git-merge/sessions/{session_id}/conflicts", response_model=List[GitMergeConflictResponse])
async def get_session_conflicts(
        session_id: str,
        session: Session = Depends(get_session)
):
    """Lấy danh sách xung đột của phiên merge git"""
    try:
        merge_service = GitMergeService(session)

        # Kiểm tra phiên tồn tại
        merge_session = merge_service.get_session(session_id)
        if not merge_session:
            raise HTTPException(status_code=404, detail="Merge session not found")

        conflicts = merge_service.get_session_conflicts(session_id)

        return conflicts

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_session_conflicts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/git-merge/conflicts/analyze", response_model=GitMergeConflictResponse)
async def analyze_conflict(
        request: AnalyzeConflictRequest,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session)
):
    """Phân tích xung đột"""
    try:
        merge_service = GitMergeService(session)

        # Kiểm tra phiên tồn tại
        merge_session = merge_service.get_session(request.session_id)
        if not merge_session:
            raise HTTPException(status_code=404, detail="Merge session not found")

        # Tạo xung đột mới
        conflict = GitMergeConflict(
            session_id=request.session_id,
            file_path=request.file_path,
            conflict_content=request.conflict_content,
            our_changes="",  # Sẽ được trích xuất trong quá trình phân tích
            their_changes="",  # Sẽ được trích xuất trong quá trình phân tích
            is_resolved=False
        )

        conflict_id = merge_service.add_conflict(conflict)

        # Phân tích xung đột trong background
        background_tasks.add_task(
            git_merge_agent._analyze_conflict_task,
            conflict_id,
            request.conflict_content,
            request.context
        )

        # Lấy thông tin xung đột đã tạo
        created_conflict = merge_service.get_conflict(conflict_id)

        if not created_conflict:
            raise HTTPException(status_code=500, detail="Failed to create conflict")

        return created_conflict

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in analyze_conflict: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in analyze_conflict: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/git-merge/conflicts/resolve", response_model=GitMergeConflictResponse)
async def resolve_conflict(
        request: ResolveConflictRequest,
        session: Session = Depends(get_session)
):
    """Giải quyết xung đột"""
    try:
        merge_service = GitMergeService(session)

        # Kiểm tra xung đột tồn tại
        conflict = merge_service.get_conflict(request.conflict_id)
        if not conflict:
            raise HTTPException(status_code=404, detail="Conflict not found")

        # Kiểm tra strategy hợp lệ
        valid_strategies = ["ours", "theirs", "custom"]
        if request.resolution_strategy not in valid_strategies:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid resolution strategy. Must be one of: {', '.join(valid_strategies)}"
            )

        # Giải quyết xung đột
        success = await git_merge_agent.resolve_conflict(
            request.conflict_id,
            request.resolved_content,
            request.resolution_strategy,
            session
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to resolve conflict")

        # Lấy thông tin xung đột đã cập nhật
        updated_conflict = merge_service.get_conflict(request.conflict_id)

        return updated_conflict

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in resolve_conflict: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in resolve_conflict: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/git-merge/complete", response_model=dict)
async def complete_merge(
        request: CompleteMergeRequest,
        background_tasks: BackgroundTasks,
        session: Session = Depends(get_session)
):
    """Hoàn thành merge"""
    try:
        # Hoàn thành merge
        success = await git_merge_agent.complete_merge(
            request.session_id,
            background_tasks,
            session
        )

        if not success:
            raise HTTPException(status_code=400, detail="Cannot complete merge. Make sure all conflicts are resolved.")

        return {"success": True, "message": "Merge process started. Check session status for completion."}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in complete_merge: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in complete_merge: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/git-merge/sessions/{session_id}", response_model=dict)
async def delete_merge_session(
        session_id: str,
        session: Session = Depends(get_session)
):
    """Xóa phiên merge git"""
    try:
        merge_service = GitMergeService(session)

        # Kiểm tra phiên tồn tại
        merge_session = merge_service.get_session(session_id)
        if not merge_session:
            raise HTTPException(status_code=404, detail="Merge session not found")

        # Xóa phiên
        success = merge_service.delete_session(session_id)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete merge session")

        return {"success": True, "message": "Merge session deleted successfully"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error in delete_merge_session: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error in delete_merge_session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")