import json
import time
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.schemas.interview import InterviewCoachReport
from app.services.graph.interview_graph import interview_graph
from app.services.interview.interview_parser import compute_interview_cache_key

def get_interview_coach(session_id: str, target_role: str, job_description: Optional[str] = None) -> InterviewCoachReport:
    """
    Orchestrate or retrieve the cached interview coach report for the given session.
    Checks session storage cache. Executes LangGraph on cache miss.
    """
    # 1. Compute cache key
    cache_key = compute_interview_cache_key(target_role, job_description)
    
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    interview_dir = session_dir / "interview"
    interview_dir.mkdir(parents=True, exist_ok=True)
    
    cache_path = interview_dir / f"{cache_key}.json"
    
    # 2. Check Cache
    if cache_path.exists():
        logger.info(f"Cache hit: Loading cached interview report for session {session_id}, key: {cache_key}")
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
            report = InterviewCoachReport.model_validate(cached_data)
            
            # Log cache hit metadata strictly matching rules
            logger.info(
                f"Interview Coaching Completed | "
                f"Session ID: {session_id} | "
                f"Cache: HIT | "
                f"Target Role: {target_role} | "
                f"Cache Key/Hash: {cache_key} | "
                f"Total Processing Time: 0.0000s"
            )
            return report
        except Exception as e:
            logger.error(f"Failed to load cached interview report: {str(e)}. Re-evaluating...")
            
    # 3. Cache Miss - Execute LangGraph
    logger.info(f"Cache miss: Running interview LangGraph for session {session_id}, key: {cache_key}")
    
    initial_state = {
        "session_id": session_id,
        "target_role": target_role,
        "job_description": job_description,
        "job_hash": cache_key, # Store cache_key as job_hash in state
        "career_profile": None,
        "master_analysis": None,
        "resume_context": None,
        "interview_focus": None,
        "report": None,
        "errors": []
    }
    
    start_time = time.time()
    try:
        final_state = interview_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph execution failed for interview coaching: {str(e)}")
        raise RuntimeError(f"Workflow execution failed: {str(e)}")
        
    duration = time.time() - start_time
    
    # Log metadata: Session ID, Cache Hit/Miss, Job hash, Total time
    logger.info(
        f"Interview Coaching Completed | "
        f"Session ID: {session_id} | "
        f"Cache: MISS | "
        f"Target Role: {target_role} | "
        f"Cache Key/Hash: {cache_key} | "
        f"Total Processing Time: {duration:.4f}s"
    )
    
    if final_state.get("errors"):
        err_msg = "; ".join(final_state["errors"])
        logger.error(f"Interview coaching workflow finished with errors: {err_msg}")
        raise ValueError(err_msg)
        
    report = final_state.get("report")
    if not report:
        raise RuntimeError("Interview coaching workflow completed but did not produce a report.")
        
    return report
