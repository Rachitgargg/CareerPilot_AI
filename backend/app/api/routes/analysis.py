from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.schemas.master_analysis import MasterAnalysis
from app.services.analysis.master_analysis import get_master_analysis
from app.core.logging import logger
from app.core.config import settings

router = APIRouter()

@router.post("/analysis/{session_id}", response_model=MasterAnalysis)
async def analyze_career(session_id: str):
    """
    Perform or retrieve Master Career Analysis for a session.
    - Validates session directory and profile.json existence.
    - Checks cache and runs LangGraph workflow if missing.
    - Returns validated MasterAnalysis response schema.
    """
    logger.info(f"Analysis request received for session: {session_id}")
    
    # 1. Verify session directory exists
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    if not session_dir.exists():
        logger.error(f"Session directory not found for ID: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found. Please upload a resume first.")
        
    # 2. Verify profile.json exists
    profile_path = session_dir / "profile.json"
    if not profile_path.exists():
        logger.error(f"profile.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Career profile not found. Please complete resume upload.")
        
    try:
        # Run analysis service inside a threadpool to avoid blocking main event loop
        analysis = await run_in_threadpool(get_master_analysis, session_id)
        return analysis
    except ValueError as e:
        logger.error(f"Validation error during master analysis: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Analysis validation failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during master analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating the career analysis.")
