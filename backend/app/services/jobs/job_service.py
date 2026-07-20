import os
import json
import time
import hashlib
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.jobs import JobDiscoveryResponse
from app.services.graph.job_graph import job_graph

def get_profile_and_analysis_hashes(session_id: str) -> tuple[str, str]:
    """
    Computes MD5/SHA-256 hashes of profile.json and master_analysis.json for cache checking.
    """
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    profile_path = session_dir / "profile.json"
    analysis_path = session_dir / "master_analysis.json"
    
    profile_hash = ""
    if profile_path.exists():
        with open(profile_path, "rb") as f:
            profile_hash = hashlib.sha256(f.read()).hexdigest()
            
    analysis_hash = ""
    if analysis_path.exists():
        with open(analysis_path, "rb") as f:
            analysis_hash = hashlib.sha256(f.read()).hexdigest()
            
    return profile_hash, analysis_hash

def compute_jobs_cache_key(
    query: str,
    location: Optional[str],
    profile_hash: str,
    analysis_hash: str
) -> str:
    """
    Computes a unique cache key based on search parameters and profile/analysis states.
    """
    q_norm = "".join(c if c.isalnum() else "_" for c in query.strip().lower())
    loc_norm = "".join(c if c.isalnum() else "_" for c in (location or "remote").strip().lower())
    
    combined = f"{q_norm}_{loc_norm}_{profile_hash}_{analysis_hash}"
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()

def get_job_discovery(
    session_id: str,
    preferred_role: Optional[str] = None,
    location: Optional[str] = None
) -> JobDiscoveryResponse:
    """
    Orchestrate job discovery and matching for the session.
    Implements session-isolated local caching.
    """
    start_time = time.time()
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    jobs_cache_dir = session_dir / "jobs"
    jobs_cache_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Determine search query first (in order to check cache key)
    # We can read profile and analysis to resolve the query deterministically
    profile_path = session_dir / "profile.json"
    profile = None
    if profile_path.exists():
        try:
            with open(profile_path, "r", encoding="utf-8") as f:
                profile_data = json.load(f)
            profile = CareerProfile.model_validate(profile_data)
        except Exception as e:
            logger.error(f"Failed to read career profile for cache query check: {str(e)}")
            
    # Resolve search query similar to the LangGraph node
    query = preferred_role or ""
    if not query.strip():
        if profile and profile.career_interests:
            query = profile.career_interests[0]
        elif profile and profile.experience:
            query = profile.experience[0].role
        else:
            query = "Software Engineer"
            
    query = query.strip()
    loc = (location or "Remote").strip()
    
    # Compute cache hashes
    profile_hash, analysis_hash = get_profile_and_analysis_hashes(session_id)
    cache_key = compute_jobs_cache_key(query, loc, profile_hash, analysis_hash)
    
    cache_path = jobs_cache_dir / f"{cache_key}.json"
    
    # 2. Check Cache
    if cache_path.exists():
        logger.info(f"Cache hit: loading cached job recommendations for session {session_id}, key: {cache_key}")
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
            report = JobDiscoveryResponse.model_validate(cached_data)
            
            # Log cache hit metadata strictly matching requirements
            logger.info(
                f"Job Discovery Completed | "
                f"Session ID: {session_id} | "
                f"Search Query: {query} | "
                f"Jobs Retrieved: {len(report.recommended_jobs)} | "
                f"Cache: HIT | "
                f"Groq Latency: 0.0000s | "
                f"Total Processing Time: 0.0000s"
            )
            return report
        except Exception as e:
            logger.error(f"Failed to load cached job recommendations: {str(e)}. Re-evaluating...")
            
    # 3. Cache Miss - Run LangGraph
    logger.info(f"Cache miss: running jobs LangGraph workflow for session {session_id}, key: {cache_key}")
    
    initial_state = {
        "session_id": session_id,
        "preferred_role": preferred_role,
        "location": location,
        "career_profile": None,
        "master_analysis": None,
        "search_query": None,
        "raw_jobs": None,
        "normalized_jobs": None,
        "scored_jobs": None,
        "report": None,
        "errors": []
    }
    
    groq_start = time.time()
    try:
        final_state = job_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph job discovery execution failed: {str(e)}")
        raise RuntimeError(f"Workflow execution failed: {str(e)}")
        
    groq_duration = time.time() - groq_start
    duration = time.time() - start_time
    
    if final_state.get("errors"):
        err_msg = "; ".join(final_state["errors"])
        logger.error(f"Job discovery workflow finished with errors: {err_msg}")
        raise ValueError(err_msg)
        
    report = final_state.get("report")
    if not report:
        raise RuntimeError("Job discovery workflow completed but did not produce a report.")
        
    # Write to Cache
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(report.model_dump_json(indent=2))
        logger.info(f"Successfully cached job recommendations to {cache_path}")
    except Exception as e:
        logger.error(f"Failed to save jobs cache: {str(e)}")
        
    # Log metadata: Session ID, search query, number of jobs retrieved, cache hit/miss, groq latency, total processing time
    logger.info(
        f"Job Discovery Completed | "
        f"Session ID: {session_id} | "
        f"Search Query: {query} | "
        f"Jobs Retrieved: {len(report.recommended_jobs)} | "
        f"Cache: MISS | "
        f"Groq Latency: {groq_duration:.4f}s | "
        f"Total Processing Time: {duration:.4f}s"
    )
    
    return report
