from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.core.logging import logger
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat.chat_service import get_chat_response

router = APIRouter()

@router.post("/chat/{session_id}", response_model=ChatResponse)
async def chat(session_id: str, request: ChatRequest):
    """
    Chat endpoint for interaction with the AI Career Mentor.
    - Validates session existence.
    - Validates career profile (profile.json) existence.
    - Executes the chat logic inside a thread pool to maintain event-loop responsiveness.
    """
    logger.info(f"Chat request received for session: {session_id}")
    
    # 1. Verify session directory exists
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    if not session_dir.exists():
        logger.error(f"Session directory not found for ID: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found. Please upload a resume first.")
        
    # 2. Verify profile.json exists
    profile_path = session_dir / "profile.json"
    if not profile_path.exists():
        logger.error(f"profile.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Career profile not found. Please complete resume upload.")
        
    try:
        # Run chat service in thread pool to avoid blocking ASGI loop
        chat_response = await run_in_threadpool(get_chat_response, session_id, request.message)
        return chat_response
    except Exception as e:
        logger.exception(f"Error during chat interaction for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during the chat interaction.")
