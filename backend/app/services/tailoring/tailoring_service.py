import hashlib
import json
from app.core.config import settings
from app.core.logging import logger
from app.schemas.tailoring import ResumeTailoringReport
from app.services.graph.tailoring_graph import tailoring_graph

def get_resume_tailoring(session_id: str, job_description: str) -> ResumeTailoringReport:
    """
    Retrieve or compute resume tailoring report for a given session and job description.
    Utilizes caching based on SHA-256 hash of job description.
    """
    # 1. Generate SHA-256 hash
    cleaned_desc = job_description.strip()
    job_hash = hashlib.sha256(cleaned_desc.encode("utf-8")).hexdigest()
    
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    tailoring_dir = session_dir / "tailoring"
    tailoring_dir.mkdir(parents=True, exist_ok=True)
    
    cache_path = tailoring_dir / f"{job_hash}.json"
    
    # 2. Check Cache
    if cache_path.exists():
        logger.info(f"Cache hit: Loading cached tailoring report for session {session_id}, hash: {job_hash}")
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
            report = ResumeTailoringReport.model_validate(cached_data)
            
            # Log cache hit metadata
            logger.info(
                f"Resume Tailoring Completed | "
                f"Session ID: {session_id} | "
                f"Cache: HIT | "
                f"Job Hash: {job_hash} | "
                f"Total Processing Time: 0.0000s"
            )
            return report
        except Exception as e:
            logger.error(f"Failed to load cached tailoring report: {str(e)}. Re-evaluating...")
            
    # 3. Cache Miss - Execute LangGraph
    logger.info(f"Cache miss: Running tailoring LangGraph for session {session_id}, hash: {job_hash}")
    
    initial_state = {
        "session_id": session_id,
        "job_description": job_description,
        "job_hash": job_hash,
        "job_requirements": None,
        "career_profile": None,
        "master_analysis": None,
        "resume_context": None,
        "tailoring_report": None,
        "errors": []
    }
    
    import time
    start_time = time.time()
    try:
        final_state = tailoring_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph execution failed for tailoring: {str(e)}")
        raise RuntimeError(f"Workflow execution failed: {str(e)}")
        
    duration = time.time() - start_time
    
    # Log metadata: Session ID, Cache Hit/Miss, Job hash, Total time
    logger.info(
        f"Resume Tailoring Completed | "
        f"Session ID: {session_id} | "
        f"Cache: MISS | "
        f"Job Hash: {job_hash} | "
        f"Total Processing Time: {duration:.4f}s"
    )
    
    if final_state.get("errors"):
        err_msg = "; ".join(final_state["errors"])
        logger.error(f"Tailoring workflow finished with errors: {err_msg}")
        raise ValueError(err_msg)
        
    report = final_state.get("tailoring_report")
    if not report:
        raise RuntimeError("Tailoring workflow completed but did not produce a report.")
        
    return report
