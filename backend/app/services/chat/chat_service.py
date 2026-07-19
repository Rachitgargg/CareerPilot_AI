import time
from app.core.logging import logger
from app.services.graph.chat_graph import chat_graph
from app.schemas.chat import ChatResponse

def get_chat_response(session_id: str, message: str) -> ChatResponse:
    """
    Business service to orchestrate the Chat LangGraph execution.
    - Measures response time.
    - Logs session metadata without exposing content.
    - Returns structured ChatResponse.
    """
    initial_state = {
        "session_id": session_id,
        "user_message": message,
        "chat_history": [],
        "intent": "general",
        "needed_tools": [],
        "context": "",
        "sources": [],
        "response": "",
        "errors": []
    }
    
    start_time = time.time()
    try:
        final_state = chat_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph execution failed for session {session_id}: {str(e)}")
        raise RuntimeError(f"Chat workflow execution failed: {str(e)}")
        
    duration = time.time() - start_time
    
    # Extract details
    intent = final_state.get("intent", "general")
    sources = final_state.get("sources") or []
    response_text = final_state.get("response", "")
    errors = final_state.get("errors") or []
    
    # Log session metadata as strictly required (never log message contents, resume, keys)
    logger.info(
        f"Chat Request Completed: "
        f"Session ID: {session_id} | "
        f"Intent: {intent} | "
        f"Tools used: {sources} | "
        f"Response time: {duration:.4f}s"
    )
    
    if errors:
        logger.warning(f"Chat workflow encountered errors for session {session_id}: {errors}")
        
    return ChatResponse(
        response=response_text,
        sources=sources
    )
