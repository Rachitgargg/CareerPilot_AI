import json
from typing import Optional
from app.core.config import settings
from app.core.logging import logger
from app.services.vector.retriever import retrieve_relevant_chunks

def load_career_profile(session_id: str, intent: str = None) -> Optional[str]:
    """
    Tool to load and slice profile.json from session storage based on detected intent.
    """
    profile_path = settings.STORAGE_DIR / "sessions" / session_id / "profile.json"
    if not profile_path.exists():
        logger.warning(f"Career profile not found for session {session_id}")
        return None
    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Perform selective slicing to optimize prompt size
        sliced_data = {}
        if intent == "skills":
            sliced_data = {
                "summary": data.get("summary"),
                "skills": data.get("skills")
            }
        elif intent == "projects":
            sliced_data = {
                "summary": data.get("summary"),
                "projects": data.get("projects"),
                "skills": data.get("skills")
            }
        elif intent == "resume_question":
            sliced_data = {
                "summary": data.get("summary"),
                "experience": data.get("experience"),
                "skills": data.get("skills")
            }
        elif intent in ("roadmap", "career_advice"):
            sliced_data = {
                "summary": data.get("summary"),
                "experience": data.get("experience"),
                "skills": data.get("skills"),
                "career_interests": data.get("career_interests")
            }
        elif intent in ("ats", "interview"):
            sliced_data = {
                "summary": data.get("summary"),
                "experience": data.get("experience"),
                "skills": data.get("skills")
            }
        else: # general / unknown
            sliced_data = {
                "summary": data.get("summary"),
                "personal": data.get("personal"),
                "skills": data.get("skills")
            }
            
        return f"User Career Profile Details (relevant to query):\n{json.dumps(sliced_data, indent=2)}"
    except Exception as e:
        logger.error(f"Error loading career profile: {str(e)}")
        return None

def load_master_analysis(session_id: str, intent: str = None) -> Optional[str]:
    """
    Tool to load and slice master_analysis.json from session storage based on detected intent.
    """
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    if not analysis_path.exists():
        logger.warning(f"Master analysis not found for session {session_id}")
        return None
    try:
        with open(analysis_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Perform selective slicing to optimize prompt size
        sliced_data = {}
        if intent == "ats":
            sliced_data = {"ats_analysis": data.get("ats_analysis")}
        elif intent == "skills":
            sliced_data = {"skills_gap": data.get("skills_gap")}
        elif intent == "projects":
            sliced_data = {"project_recommendations": data.get("project_recommendations")}
        elif intent == "roadmap":
            sliced_data = {"learning_roadmap": data.get("learning_roadmap")}
        elif intent == "interview":
            sliced_data = {"interview_focus": data.get("interview_focus")}
        elif intent == "career_advice":
            sliced_data = {
                "career_summary": data.get("career_summary"),
                "career_recommendations": data.get("career_recommendations")
            }
        else: # general / unknown
            sliced_data = {"career_summary": data.get("career_summary")}
            
        return f"User Master Career Analysis Details (relevant to query):\n{json.dumps(sliced_data, indent=2)}"
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
