import json
from app.core.config import settings
from app.core.logging import logger
from app.schemas.master_analysis import MasterAnalysis
from app.services.graph.career_graph import career_graph

def get_master_analysis(session_id: str) -> MasterAnalysis:
    """
    Get master career analysis for a session.
    Checks the cache first. If not cached, executes the LangGraph workflow.
    """
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    analysis_path = session_dir / "master_analysis.json"
    
    if analysis_path.exists():
        logger.info(f"Cache hit: loading cached master analysis for session {session_id}")
        try:
            with open(analysis_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            analysis = MasterAnalysis.model_validate(data)
            return analysis
        except Exception as e:
            logger.error(f"Failed to parse cached master analysis: {str(e)}. Regenerating...")
            
    # Cache miss or corrupted cache -> execute LangGraph workflow
    logger.info(f"Cache miss: running LangGraph master analysis workflow for session {session_id}")
    
    initial_state = {
        "session_id": session_id,
        "career_profile": None,
        "resume_context": None,
        "master_analysis": None,
        "errors": []
    }
    
    import time
    start_time = time.time()
    try:
        final_state = career_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph execution failed for session {session_id}: {str(e)}")
        raise RuntimeError(f"Workflow execution failed: {str(e)}")
        
    duration = time.time() - start_time
    logger.info(f"LangGraph workflow execution completed in {duration:.4f} seconds for session {session_id}")
        
    if final_state.get("errors"):
        err_msg = "; ".join(final_state["errors"])
        logger.error(f"Workflow finished with errors for session {session_id}: {err_msg}")
        raise ValueError(err_msg)
        
    analysis = final_state.get("master_analysis")
    if not analysis:
        logger.error(f"Workflow finished without generating master analysis for session {session_id}")
        raise RuntimeError("Failed to generate master career analysis.")
        
    return analysis
