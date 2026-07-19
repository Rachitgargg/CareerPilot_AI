from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.core.logging import logger
from app.schemas.interview import InterviewRequest, InterviewCoachReport
from app.services.interview.interview_service import get_interview_coach

router = APIRouter()

@router.post("/interview/{session_id}", response_model=InterviewCoachReport)
async def generate_interview_coaching(session_id: str, request: InterviewRequest):
    """
    Endpoint to generate a personalized Interview Coaching Report.
    - Validates target role cannot be empty (HTTP 400).
    - Validates session existence (HTTP 404).
    - Validates CareerProfile existence (HTTP 404).
    - Validates MasterAnalysis existence (HTTP 404).
    - Dispatches logic to a thread pool to avoid blocking the event loop.
    """
    logger.info(f"Interview coaching request received for session: {session_id}, role: {request.target_role}")
    
    # 1. Validate empty target role
    if not request.target_role or not request.target_role.strip():
        logger.error("Empty target role received.")
        raise HTTPException(status_code=400, detail="Target role cannot be empty.")
        
    # 2. Verify session directory exists
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    if not session_dir.exists():
        logger.error(f"Session directory not found: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found. Please upload a resume first.")
        
    # 3. Verify profile.json exists
    profile_path = session_dir / "profile.json"
    if not profile_path.exists():
        logger.error(f"profile.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Career profile not found. Please complete resume upload.")
        
    # 4. Verify master_analysis.json exists
    analysis_path = session_dir / "master_analysis.json"
    if not analysis_path.exists():
        logger.error(f"master_analysis.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Master career analysis not found. Please complete career analysis first.")
        
    try:
        # Run caching and LangGraph workflow in thread pool
        report = await run_in_threadpool(
            get_interview_coach, 
            session_id, 
            request.target_role, 
            request.job_description
        )
        return report
    except Exception as e:
        logger.exception(f"Unexpected error during interview coaching generation: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating the interview coaching report.")
