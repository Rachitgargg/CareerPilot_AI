from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.core.logging import logger
from app.schemas.jobs import JobDiscoveryRequest, JobDiscoveryResponse
from app.services.jobs.job_service import get_job_discovery

router = APIRouter()

@router.post("/jobs/{session_id}", response_model=JobDiscoveryResponse)
async def discover_jobs(session_id: str, request: JobDiscoveryRequest):
    """
    Endpoint to dynamically discover and rank job listings tailored to the candidate's career details.
    - Validates session existence (HTTP 404).
    - Validates CareerProfile existence (HTTP 404).
    - Validates MasterAnalysis existence (HTTP 404).
    - Runs matching pipeline inside a thread pool.
    """
    logger.info(f"Job discovery request received for session: {session_id}")
    
    # 1. Verify session directory exists
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    if not session_dir.exists():
        logger.error(f"Session directory not found: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found. Please upload a resume first.")
        
    # 2. Verify profile.json exists
    profile_path = session_dir / "profile.json"
    if not profile_path.exists():
        logger.error(f"profile.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Career profile not found. Please complete resume upload.")
        
    # 3. Verify master_analysis.json exists
    analysis_path = session_dir / "master_analysis.json"
    if not analysis_path.exists():
        logger.error(f"master_analysis.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Master career analysis not found. Please complete career analysis first.")
        
    try:
        # Run matching pipeline in a threadpool to keep FastAPI async loop non-blocking
        report = await run_in_threadpool(
            get_job_discovery,
            session_id,
            request.preferred_role,
            request.location
        )
        return report
    except Exception as e:
        logger.exception(f"Unexpected error during job discovery: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating job recommendations.")
