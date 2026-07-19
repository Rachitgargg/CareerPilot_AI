import json
from pathlib import Path
from app.core.config import settings
from app.core.logging import logger
from app.services.llm.ai_service import extract_resume_profile
from app.services.resume.chunker import chunk_resume
from app.services.vector.chroma_client import get_vector_store

def process_resume(session_id: str, cleaned_text: str) -> int:
    """
    Orchestrates the resume processing pipeline:
    1. Extracts structured CareerProfile using Groq LLM.
    2. Writes CareerProfile JSON to session storage: storage/sessions/{session_id}/profile.json.
    3. Splits cleaned text into semantic character chunks.
    4. Generates embeddings using Gemini and stores them in ChromaDB.
    5. Returns the number of chunks created.
    """
    logger.info(f"Starting resume processing pipeline for session: {session_id}")
    
    # 1. Extract CareerProfile via AI Service
    profile = extract_resume_profile(cleaned_text)
    
    # 2. Establish session directory path
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    profile_path = session_dir / "profile.json"
    logger.info(f"Saving extracted career profile JSON to: {profile_path}")
    
    # 3. Serialize and save profile.json
    try:
        with open(profile_path, "w", encoding="utf-8") as f:
            f.write(profile.model_dump_json(indent=2))
        logger.info(f"Successfully saved profile.json for session {session_id}")
    except Exception as e:
        logger.error(f"Failed to write profile.json for session {session_id}: {str(e)}")
        raise RuntimeError(f"Failed to save profile JSON: {str(e)}")
        
    # 4. Chunk clean resume text
    chunks = chunk_resume(cleaned_text)
    if not chunks:
        logger.warning(f"No chunks generated for resume in session {session_id}")
        return 0
        
    # 5. Connect to ChromaDB and store documents
    try:
        logger.info(f"Storing {len(chunks)} chunks in ChromaDB for session {session_id}...")
        db = get_vector_store(session_id)
        db.add_documents(chunks)
        logger.info(f"Successfully populated ChromaDB vector database for session {session_id}.")
    except Exception as e:
        logger.error(f"Failed to write to ChromaDB for session {session_id}: {str(e)}")
        raise RuntimeError(f"Vector storage failure: {str(e)}")
        
    return len(chunks)
