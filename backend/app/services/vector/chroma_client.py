import chromadb
from langchain_community.vectorstores import Chroma
from app.core.config import settings
from app.services.llm.ai_service import get_embeddings_instance
from app.core.logging import logger

def get_chroma_client(session_id: str) -> chromadb.PersistentClient:
    """
    Get the underlying raw chromadb.PersistentClient for a specific session.
    """
    persist_dir = str(settings.STORAGE_DIR / "sessions" / session_id / "chroma")
    logger.info(f"Creating raw Chroma persistent client at {persist_dir}")
    return chromadb.PersistentClient(path=persist_dir)

def get_vector_store(session_id: str) -> Chroma:
    """
    Get a persistent LangChain Chroma database instance for a specific session.
    """
    persist_dir = str(settings.STORAGE_DIR / "sessions" / session_id / "chroma")
    logger.info(f"Initializing persistent ChromaDB vector store at {persist_dir}")
    
    # Obtain the embeddings client instance from the isolated AI service layer
    embeddings = get_embeddings_instance()
    
    return Chroma(
        collection_name="career_profile",
        embedding_function=embeddings,
        persist_directory=persist_dir
    )
