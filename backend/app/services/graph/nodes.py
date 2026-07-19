import json
from app.core.config import settings
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.services.llm import ai_service
from app.services.vector.retriever import retrieve_relevant_chunks

def load_profile_node(state: dict) -> dict:
    """
    Node that loads the profile.json file for the current session.
    """
    session_id = state.get("session_id")
    logger.info(f"[LangGraph Node] Running load_profile for session {session_id}")
    
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
        logger.info(f"[LangGraph Node] Successfully loaded profile.json for session {session_id}")
        return {"career_profile": profile}
    except Exception as e:
        err = f"Failed to load or validate career profile: {str(e)}"
        logger.error(err)
        errors.append(err)
        return {"errors": errors}

def retrieve_context_node(state: dict) -> dict:
    """
    Node that retrieves top k=4 relevant chunks from the session's vector database.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping retrieve_context due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    logger.info(f"[LangGraph Node] Running retrieve_context for session {session_id}")
    
    try:
        # Use key areas as the retrieval query to pull rich context for analysis
        query = "work experience, professional projects, technical skills, core certifications, academic education"
        docs = retrieve_relevant_chunks(session_id, query=query, k=4)
        
        # Combine chunk content
        context_str = "\n\n".join([doc.page_content for doc in docs])
        logger.info(f"[LangGraph Node] Successfully retrieved {len(docs)} resume chunks for session {session_id}")
        return {"resume_context": context_str}
    except Exception as e:
        logger.warning(f"[LangGraph Node] Failed to retrieve context from ChromaDB: {str(e)}. Proceeding without context.")
        return {"resume_context": ""}

def analyze_node(state: dict) -> dict:
    """
    Node that calls Groq completion API via ai_service to perform master analysis.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping analyze due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    logger.info(f"[LangGraph Node] Running analyze for session {session_id}")
    
    profile = state.get("career_profile")
    context = state.get("resume_context")
    
    try:
        analysis = ai_service.generate_master_analysis(profile, context)
        logger.info(f"[LangGraph Node] Successfully generated master analysis for session {session_id}")
        return {"master_analysis": analysis}
    except Exception as e:
        err = f"Master analysis generation failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def validate_node(state: dict) -> dict:
    """
    Node that double-checks compliance of the generated analysis with the Pydantic schema.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping validate due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    logger.info(f"[LangGraph Node] Running validate for session {session_id}")
    
    analysis = state.get("master_analysis")
    if not analysis:
        err = "Validation error: master_analysis is empty in state."
        logger.error(err)
        return {"errors": [err]}
        
    try:
        # Re-validate the object
        from app.schemas.master_analysis import MasterAnalysis
        MasterAnalysis.model_validate(analysis)
        logger.info(f"[LangGraph Node] Master analysis validation check passed for session {session_id}")
        return {}
    except Exception as e:
        err = f"Generated analysis validation failed: {str(e)}"
        logger.error(err)
        return {"errors": [err]}

def persist_node(state: dict) -> dict:
    """
    Node that saves the validated MasterAnalysis as master_analysis.json in the session folder.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping persist due to upstream errors.")
        return {}
        
    session_id = state.get("session_id")
    logger.info(f"[LangGraph Node] Running persist for session {session_id}")
    
    analysis = state.get("master_analysis")
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    analysis_path = session_dir / "master_analysis.json"
    
    try:
        with open(analysis_path, "w", encoding="utf-8") as f:
            f.write(analysis.model_dump_json(indent=2))
        logger.info(f"[LangGraph Node] Successfully saved master_analysis.json for session {session_id}")
        return {}
    except Exception as e:
        err = f"Failed to save master_analysis.json: {str(e)}"
        logger.error(err)
        return {"errors": [err]}
