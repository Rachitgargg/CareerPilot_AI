import json
from app.core.config import settings
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.tailoring import ResumeTailoringReport
from app.services.llm import ai_service
from app.services.vector.retriever import retrieve_relevant_chunks
from app.services.tailoring.job_parser import extract_job_requirements

def load_profile_node(state: dict) -> dict:
    """
    Node to load profile.json.
    """
    session_id = state["session_id"]
    logger.info(f"[Tailoring Node] Running load_profile for session {session_id}")
    profile_path = settings.STORAGE_DIR / "sessions" / session_id / "profile.json"
    
    if not profile_path.exists():
        err = f"Profile file not found at: {profile_path}"
        logger.error(err)
        return {"errors": [err]}
        
    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            profile_data = json.load(f)
        profile = CareerProfile.model_validate(profile_data)
        return {"career_profile": profile}
    except Exception as e:
        err = f"Failed to load career profile: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def load_master_analysis_node(state: dict) -> dict:
    """
    Node to load master_analysis.json.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    session_id = state["session_id"]
    logger.info(f"[Tailoring Node] Running load_master_analysis for session {session_id}")
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    
    if not analysis_path.exists():
        err = f"Master analysis file not found at: {analysis_path}"
        logger.error(err)
        return {"errors": [err]}
        
    try:
        with open(analysis_path, "r", encoding="utf-8") as f:
            analysis_data = json.load(f)
        analysis = MasterAnalysis.model_validate(analysis_data)
        return {"master_analysis": analysis}
    except Exception as e:
        err = f"Failed to load master career analysis: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def retrieve_context_node(state: dict) -> dict:
    """
    Node that parses the job description and pulls semantic context from ChromaDB.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    session_id = state["session_id"]
    job_description = state["job_description"]
    logger.info(f"[Tailoring Node] Running retrieve_context for session {session_id}")
    
    try:
        # Parse job description
        job_reqs = extract_job_requirements(job_description)
        
        # Build concise query from job title and key required skills
        title = job_reqs.get("job_title", "")
        skills = ", ".join(job_reqs.get("required_skills", [])[:5])
        query_terms = f"{title} {skills}".strip()
        
        # Retrieve chunks (k=4)
        logger.info(f"[Tailoring Node] Querying ChromaDB with terms: '{query_terms}'")
        docs = retrieve_relevant_chunks(session_id, query=query_terms or "resume details", k=4)
        resume_context = "\n\n".join([doc.page_content for doc in docs])
        
        return {
            "job_requirements": job_reqs,
            "resume_context": resume_context
        }
    except Exception as e:
        logger.warning(f"[Tailoring Node] Failed to retrieve context from ChromaDB: {str(e)}. Proceeding without context.")
        return {"resume_context": ""}

def tailoring_analysis_node(state: dict) -> dict:
    """
    Node that executes the Groq tailoring reasoning API call.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    session_id = state["session_id"]
    profile = state["career_profile"]
    analysis = state["master_analysis"]
    resume_context = state.get("resume_context") or ""
    job_description = state["job_description"]
    
    logger.info(f"[Tailoring Node] Running tailoring_analysis for session {session_id}")
    
    try:
        report = ai_service.generate_resume_tailoring(
            profile,
            analysis,
            resume_context,
            job_description
        )
        return {"tailoring_report": report}
    except Exception as e:
        err = f"Resume tailoring generation failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def validate_output_node(state: dict) -> dict:
    """
    Node that validates tailoring report schema compliance.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    session_id = state["session_id"]
    report = state.get("tailoring_report")
    logger.info(f"[Tailoring Node] Running validate_output for session {session_id}")
    
    if not report:
        err = "Validation error: tailoring_report is empty in state."
        logger.error(err)
        return {"errors": [err]}
        
    try:
        ResumeTailoringReport.model_validate(report)
        return {}
    except Exception as e:
        err = f"Resume tailoring validation check failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def persist_cache_node(state: dict) -> dict:
    """
    Node that saves the tailoring analysis as {job_hash}.json in the session's tailoring directory.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    session_id = state["session_id"]
    job_hash = state["job_hash"]
    report = state["tailoring_report"]
    
    logger.info(f"[Tailoring Node] Running persist_cache for session {session_id}, hash {job_hash}")
    
    tailoring_dir = settings.STORAGE_DIR / "sessions" / session_id / "tailoring"
    tailoring_dir.mkdir(parents=True, exist_ok=True)
    cache_path = tailoring_dir / f"{job_hash}.json"
    
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(report.model_dump_json(indent=2))
        logger.info(f"[Tailoring Node] Successfully persisted tailoring report to {cache_path}")
        return {}
    except Exception as e:
        err = f"Failed to persist cache: {str(e)}"
        logger.error(err)
        return {"errors": [err]}
