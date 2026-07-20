import json
from app.core.config import settings
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.jobs import JobDiscoveryResponse
from app.services.llm import ai_service
from app.services.jobs.job_search import search_jobs
from app.services.jobs.job_matcher import normalize_job_listings, rank_and_select_jobs

def load_profile_node(state: dict) -> dict:
    """
    Node that loads the profile.json for the session.
    """
    session_id = state.get("session_id")
    logger.info(f"[Job Node] Running load_profile for session {session_id}")
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
        logger.info(f"[Job Node] Successfully loaded profile.json for session {session_id}")
        return {"career_profile": profile}
    except Exception as e:
        err = f"Failed to load or validate career profile: {str(e)}"
        logger.error(err)
        errors.append(err)
        return {"errors": errors}

def load_master_analysis_node(state: dict) -> dict:
    """
    Node that loads the master_analysis.json for the session.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    session_id = state.get("session_id")
    logger.info(f"[Job Node] Running load_master_analysis for session {session_id}")
    
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    if not analysis_path.exists():
        err = f"Master career analysis not found at: {analysis_path}"
        logger.error(err)
        return {"errors": [err]}
        
    try:
        with open(analysis_path, "r", encoding="utf-8") as f:
            analysis_data = json.load(f)
        analysis = MasterAnalysis.model_validate(analysis_data)
        logger.info(f"[Job Node] Successfully loaded master_analysis.json for session {session_id}")
        return {"master_analysis": analysis}
    except Exception as e:
        err = f"Failed to load or validate master analysis: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def generate_search_query_node(state: dict) -> dict:
    """
    Node that deterministically generates or infers the preferred role query string.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    pref_role = state.get("preferred_role")
    profile = state.get("career_profile")
    analysis = state.get("master_analysis")
    
    if pref_role and pref_role.strip():
        query = pref_role.strip()
    else:
        # Infer role from profile career_interests or master analysis summary or experience
        if profile.career_interests:
            query = profile.career_interests[0]
        elif profile.experience:
            query = profile.experience[0].role
        else:
            query = "Software Engineer"
            
    logger.info(f"[Job Node] Generated search query: {query}")
    return {"search_query": query}

def search_jobs_node(state: dict) -> dict:
    """
    Node that retrieves a pool of 20-30 jobs based on profile information and search query parameters.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    query = state.get("search_query")
    location = state.get("location")
    profile = state.get("career_profile")
    
    # Extract graduation details & student status to match internships/entry-level jobs if applicable
    is_student = False
    grad_year = None
    
    if profile.education:
        for edu in profile.education:
            if edu.end_year:
                grad_year = str(edu.end_year).strip()
                # If graduation year is in future or current, assume student status
                try:
                    if int(grad_year) >= 2025:
                        is_student = True
                except ValueError:
                    pass
                    
    candidate_skills = []
    if profile.skills:
        for cat in ["programming_languages", "frameworks", "tools", "databases", "ai_ml_skills"]:
            candidate_skills.extend(getattr(profile.skills, cat, []) or [])
            
    interests = profile.career_interests or []
    
    logger.info(f"[Job Node] Searching jobs for query='{query}', location='{location}'")
    try:
        raw_list = search_jobs(
            preferred_role=query,
            location=location,
            skills=candidate_skills,
            career_interests=interests,
            is_student=is_student,
            graduation_year=grad_year
        )
        logger.info(f"[Job Node] Retrieved {len(raw_list)} raw job listings.")
        return {"raw_jobs": raw_list}
    except Exception as e:
        err = f"Failed to retrieve jobs: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def normalize_jobs_node(state: dict) -> dict:
    """
    Node that normalizes the retrieved jobs.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    raw_list = state.get("raw_jobs") or []
    logger.info(f"[Job Node] Normalizing {len(raw_list)} jobs")
    try:
        norm_list = normalize_job_listings(raw_list)
        return {"normalized_jobs": norm_list}
    except Exception as e:
        err = f"Normalization failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def python_match_scoring_node(state: dict) -> dict:
    """
    Node that matches, scores, and ranks the normalized job listings, keeping the top 10.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    norm_list = state.get("normalized_jobs") or []
    profile = state.get("career_profile")
    query = state.get("search_query")
    location = state.get("location")
    
    logger.info(f"[Job Node] Running Python matching and scoring on {len(norm_list)} jobs")
    try:
        scored = rank_and_select_jobs(
            normalized_jobs=norm_list,
            profile=profile,
            preferred_role=query,
            preferred_location=location
        )
        logger.info(f"[Job Node] Scoring completed. Ranked and kept top {len(scored)} jobs.")
        return {"scored_jobs": scored}
    except Exception as e:
        err = f"Match scoring failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def generate_recommendations_node(state: dict) -> dict:
    """
    Node that invokes Groq reasoning to enrich the top 10 jobs with personalized recommendations.
    """
    errors = state.get("errors") or []
    if errors:
        return {}
        
    profile = state.get("career_profile")
    analysis = state.get("master_analysis")
    scored = state.get("scored_jobs") or []
    query = state.get("search_query")
    
    logger.info(f"[Job Node] Generating AI recommendations using Groq for {len(scored)} jobs")
    try:
        report = ai_service.generate_job_recommendations(
            profile=profile,
            analysis=analysis,
            jobs_list=scored,
            target_role=query
        )
        return {"report": report}
    except Exception as e:
        err = f"AI job recommendation generation failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}
