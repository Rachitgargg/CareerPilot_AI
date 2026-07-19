from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.core.logging import logger
from app.schemas.tailoring import TailoringRequest, ResumeTailoringReport
from app.services.tailoring.tailoring_service import get_resume_tailoring

router = APIRouter()

@router.post("/tailor/{session_id}", response_model=ResumeTailoringReport)
async def tailor_resume(session_id: str, request: TailoringRequest):
    """
    Endpoint to analyze and tailor a candidate's resume for a specific job description.
    - Validates empty job description (HTTP 400).
    - Validates session existence (HTTP 404).
    - Validates CareerProfile existence (HTTP 404).
    - Validates MasterAnalysis existence (HTTP 404).
    - Dispatches logic in thread pool.
    """
    logger.info(f"Resume tailoring request received for session: {session_id}")
    
    # 1. Validate empty job description
    if not request.job_description or not request.job_description.strip():
        logger.error("Empty job description received.")
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
        
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
        # Run tailoring service inside a threadpool to prevent blocking the event loop
        report = await run_in_threadpool(get_resume_tailoring, session_id, request.job_description)
        return report
    except Exception as e:
        logger.exception(f"Unexpected error during resume tailoring: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating the tailoring report.")
