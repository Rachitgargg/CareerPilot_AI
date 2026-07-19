import json
from app.core.config import settings
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.interview import InterviewCoachReport
from app.services.llm import ai_service
from app.services.vector.retriever import retrieve_relevant_chunks
from app.services.interview.interview_parser import determine_interview_focus

def load_profile_node(state: dict) -> dict:
    """
    Node that loads the profile.json file for the current session.
    """
    session_id = state.get("session_id")
    logger.info(f"[Interview Node] Running load_profile for session {session_id}")
    errors = list(state.get("errors") or [])
    
    profile_path = settings.STORAGE_DIR / "sessions" / session_id / "profile.json"
    if not profile_path.exists():
        err = f"Profile file not found at: {profile_path}"
        logger.error(err)
        errors.append(err)
        return {"errors": errors}
        
    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            profile_data = json.load(f)
        profile = CareerProfile.model_validate(profile_data)
        logger.info(f"[Interview Node] Successfully loaded profile.json for session {session_id}")
        return {"career_profile": profile}
    except Exception as e:
        err = f"Failed to load or validate career profile: {str(e)}"
        logger.error(err)
        errors.append(err)
        return {"errors": errors}

def load_master_analysis_node(state: dict) -> dict:
    """
    Node that loads the master_analysis.json for the current session.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[Interview Node] Skipping load_master_analysis due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    logger.info(f"[Interview Node] Running load_master_analysis for session {session_id}")
    
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    if not analysis_path.exists():
        err = f"Master career analysis not found at: {analysis_path}"
        logger.error(err)
        return {"errors": [err]}
        
    try:
        with open(analysis_path, "r", encoding="utf-8") as f:
            analysis_data = json.load(f)
        analysis = MasterAnalysis.model_validate(analysis_data)
        logger.info(f"[Interview Node] Successfully loaded master_analysis.json for session {session_id}")
        return {"master_analysis": analysis}
    except Exception as e:
        err = f"Failed to load or validate master analysis: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def retrieve_resume_context_node(state: dict) -> dict:
    """
    Node that retrieves top k=4 relevant chunks from the session's vector database.
    Uses target role and optional job description keywords to search.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[Interview Node] Skipping retrieve_resume_context due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    target_role = state.get("target_role")
    job_description = state.get("job_description")
    logger.info(f"[Interview Node] Running retrieve_resume_context for session {session_id}")
    
    try:
        # Build optimized query
        query = f"Interview preparation for {target_role}."
        if job_description:
            query += f" Requirements: {job_description[:200]}"
            
        docs = retrieve_relevant_chunks(session_id, query=query, k=4)
        context_str = "\n\n".join([doc.page_content for doc in docs])
        logger.info(f"[Interview Node] Successfully retrieved {len(docs)} resume chunks for session {session_id}")
        return {"resume_context": context_str}
    except Exception as e:
        logger.warning(f"[Interview Node] Failed to retrieve context from ChromaDB: {str(e)}. Proceeding without context.")
        return {"resume_context": ""}

def determine_focus_node(state: dict) -> dict:
    """
    Node to determine interview Focus details deterministically (difficulty, focus areas, topics).
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[Interview Node] Skipping determine_focus due to upstream errors.")
        return {}
        
    target_role = state.get("target_role")
    career_profile = state.get("career_profile")
    master_analysis = state.get("master_analysis")
    job_description = state.get("job_description")
    
    logger.info(f"[Interview Node] Determining interview focus for: {target_role}")
    try:
        focus = determine_interview_focus(
            target_role=target_role,
            career_profile=career_profile,
            master_analysis=master_analysis,
            job_description=job_description
        )
        return {"interview_focus": focus}
    except Exception as e:
        err = f"Failed to determine interview focus: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def generate_report_node(state: dict) -> dict:
    """
    Node that runs the single Groq reasoning call to build the coach report.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[Interview Node] Skipping generate_report due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    target_role = state.get("target_role")
    career_profile = state.get("career_profile")
    master_analysis = state.get("master_analysis")
    resume_context = state.get("resume_context")
    job_description = state.get("job_description")
    interview_focus = state.get("interview_focus")
    
    logger.info(f"[Interview Node] Invoking Groq for interview coaching for session {session_id}")
    try:
        report = ai_service.generate_interview_coach(
            profile=career_profile,
            analysis=master_analysis,
            resume_context=resume_context,
            target_role=target_role,
            interview_focus=interview_focus,
            job_description=job_description
        )
        return {"report": report}
    except Exception as e:
        err = f"Interview coach report generation failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def validate_report_node(state: dict) -> dict:
    """
    Node to validate generated coach report schema compliance.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[Interview Node] Skipping validate_report due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    report = state.get("report")
    
    logger.info(f"[Interview Node] Validating generated report for session {session_id}")
    if not report:
        err = "Validation error: interview report is empty in state."
        logger.error(err)
        return {"errors": [err]}
        
    try:
        InterviewCoachReport.model_validate(report)
        logger.info(f"[Interview Node] Report validated successfully for session {session_id}")
        return {}
    except Exception as e:
        err = f"Interview report validation check failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def persist_cache_node(state: dict) -> dict:
    """
    Node that saves the validated InterviewCoachReport as {cache_key}.json in the session's interview directory.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[Interview Node] Skipping persist_cache due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    report = state.get("report")
    job_hash = state.get("job_hash") # represents the cache key
    
    logger.info(f"[Interview Node] Running persist_cache for session {session_id}, hash/key {job_hash}")
    
    interview_dir = settings.STORAGE_DIR / "sessions" / session_id / "interview"
    interview_dir.mkdir(parents=True, exist_ok=True)
    cache_path = interview_dir / f"{job_hash}.json"
    
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(report.model_dump_json(by_alias=True, indent=2))
        logger.info(f"[Interview Node] Successfully persisted interview coach report to {cache_path}")
        return {}
    except Exception as e:
        err = f"Failed to save interview coach report cache: {str(e)}"
        logger.error(err)
        return {"errors": [err]}
