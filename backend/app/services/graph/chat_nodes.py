import json
from app.core.config import settings
from app.core.logging import logger
from app.services.llm import ai_service
from app.services.graph.chat_tools import CHAT_TOOLS

def load_memory_node(state: dict) -> dict:
    """
    Loads conversation history from session folder: storage/sessions/{session_id}/chat_history.json
    """
    session_id = state["session_id"]
    logger.info(f"[LangGraph Node] Running load_memory for session {session_id}")
    
    history_path = settings.STORAGE_DIR / "sessions" / session_id / "chat_history.json"
    if history_path.exists():
        try:
            with open(history_path, "r", encoding="utf-8") as f:
                history = json.load(f)
            if not isinstance(history, list):
                logger.warning(f"Chat history is not a list for session {session_id}. Resetting.")
                history = []
            logger.info(f"[LangGraph Node] Loaded {len(history)} messages from history.")
            return {"chat_history": history}
        except Exception as e:
            logger.error(f"Failed to read chat history: {str(e)}")
            return {"chat_history": [], "errors": [f"Failed to load chat history: {str(e)}"]}
            
    logger.info("[LangGraph Node] No chat history found, starting new session.")
    return {"chat_history": []}

def intent_detection_node(state: dict) -> dict:
    """
    Analyzes current user message & conversation history to detect intent.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping intent detection due to upstream errors.")
        return {}
        
    user_message = state["user_message"]
    chat_history = state.get("chat_history") or []
    
    try:
        intent = ai_service.detect_intent_with_groq(user_message, chat_history)
        return {"intent": intent}
    except Exception as e:
        logger.error(f"Intent detection failed: {str(e)}")
        return {"intent": "general", "errors": [f"Intent detection failed: {str(e)}"]}

def context_builder_node(state: dict) -> dict:
    """
    Determines required tools based on the detected intent.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping context builder due to upstream errors.")
        return {}
        
    intent = state.get("intent", "general")
    
    # Map intent to required tools
    intent_tools_map = {
        "career_advice": ["load_profile", "load_analysis"],
        "resume_question": ["load_profile", "retrieve_resume"],
        "skills": ["load_profile", "load_analysis"],
        "projects": ["load_profile", "load_analysis"],
        "roadmap": ["load_profile", "load_analysis"],
        "ats": ["load_profile", "load_analysis"],
        "interview": ["load_profile", "load_analysis"],
        "general": ["load_profile"]
    }
    
    needed_tools = intent_tools_map.get(intent, ["load_profile"])
    logger.info(f"[LangGraph Node] Context Builder selected tools {needed_tools} for intent '{intent}'")
    return {"needed_tools": needed_tools}

def tool_router_node(state: dict) -> dict:
    """
    Executes the designated tools to pull profile details, master analysis details,
    or similarity-based resume context, then joins them into a unified context string.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping tool router due to upstream errors.")
        return {}
        
    session_id = state["session_id"]
    user_message = state["user_message"]
    needed_tools = state.get("needed_tools") or []
    intent = state.get("intent", "general")
    
    contexts = []
    sources = []
    
    for tool_name in needed_tools:
        if tool_name == "load_profile":
            result = CHAT_TOOLS["load_profile"](session_id, intent=intent)
            if result:
                contexts.append(result)
                sources.append("career_profile")
        elif tool_name == "load_analysis":
            result = CHAT_TOOLS["load_analysis"](session_id, intent=intent)
            if result:
                contexts.append(result)
                sources.append("master_analysis")
        elif tool_name == "retrieve_resume":
            result = CHAT_TOOLS["retrieve_resume"](session_id, user_message)
            if result:
                contexts.append(result)
                sources.append("resume")
                
    compiled_context = "\n\n===\n\n".join(contexts) if contexts else ""
    logger.info(f"[LangGraph Node] Compiled context from sources: {sources}")
    return {
        "context": compiled_context,
        "sources": sources
    }

def response_generation_node(state: dict) -> dict:
    """
    Generates a professional response with Groq LLM.
    """
    errors = state.get("errors") or []
    if errors:
        logger.info("[LangGraph Node] Skipping response generation due to upstream errors.")
        fallback = "I apologize, but I encountered an error and cannot process your message right now."
        return {"response": fallback}
        
    context = state.get("context", "")
    chat_history = state.get("chat_history") or []
    user_message = state["user_message"]
    
    try:
        response = ai_service.generate_chat_response_with_groq(context, chat_history, user_message)
        return {"response": response}
    except Exception as e:
        logger.error(f"Response generation failed: {str(e)}")
        fallback = "I apologize, but I encountered an error generating a response right now. Please try again."
        return {"response": fallback, "errors": [f"Response generation failed: {str(e)}"]}

def save_memory_node(state: dict) -> dict:
    """
    Appends the current user message and generated response to the chat history,
    and persists it under storage/sessions/{session_id}/chat_history.json
    """
    session_id = state["session_id"]
    chat_history = list(state.get("chat_history") or [])
    user_message = state["user_message"]
    response = state.get("response", "")
    
    # Check if this message pair was already appended to prevent double-saving
    # (especially useful if node is run multiple times or manually invoked)
    already_appended = False
    if len(chat_history) >= 2:
        last_two = chat_history[-2:]
        if (last_two[0].get("role") == "user" and last_two[0].get("content") == user_message and
            last_two[1].get("role") == "assistant" and last_two[1].get("content") == response):
            already_appended = True
            
    if not already_appended:
        chat_history.append({"role": "user", "content": user_message})
        chat_history.append({"role": "assistant", "content": response})
        
    # Write to session history file
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    history_path = session_dir / "chat_history.json"
    
    try:
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(chat_history, f, indent=2)
        logger.info(f"[LangGraph Node] Saved chat history to {history_path}")
    except Exception as e:
        logger.error(f"Failed to save chat history: {str(e)}")
        
    return {"chat_history": chat_history}
