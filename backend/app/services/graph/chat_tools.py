import json
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.services.vector.retriever import retrieve_relevant_chunks

def load_career_profile(session_id: str, query: str = None) -> Optional[str]:
    """
    Tool to load profile.json from session storage.
    """
    profile_path = settings.STORAGE_DIR / "sessions" / session_id / "profile.json"
    if not profile_path.exists():
        logger.warning(f"Career profile not found for session {session_id}")
        return None
    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return f"User Career Profile Details:\n{json.dumps(data, indent=2)}"
    except Exception as e:
        logger.error(f"Error loading career profile: {str(e)}")
        return None

def load_master_analysis(session_id: str, query: str = None) -> Optional[str]:
    """
    Tool to load master_analysis.json from session storage.
    """
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    if not analysis_path.exists():
        logger.warning(f"Master analysis not found for session {session_id}")
        return None
    try:
        with open(analysis_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return f"User Master Career Analysis Details:\n{json.dumps(data, indent=2)}"
    except Exception as e:
        logger.error(f"Error loading master analysis: {str(e)}")
        return None

def retrieve_resume_context(session_id: str, query: str) -> Optional[str]:
    """
    Tool to query ChromaDB and retrieve the top k=4 relevant resume excerpts.
    """
    if not query:
        return None
    try:
        docs = retrieve_relevant_chunks(session_id, query=query, k=4)
        if not docs:
            logger.info(f"No resume chunks retrieved for query: '{query}'")
            return None
        return "Relevant Resume Excerpts:\n" + "\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        logger.error(f"Error retrieving resume context: {str(e)}")
        return None

# Registry of tools to easily add future tools
CHAT_TOOLS = {
    "load_profile": load_career_profile,
    "load_analysis": load_master_analysis,
    "retrieve_resume": retrieve_resume_context
}
