from langchain_core.documents import Document
from app.services.vector.chroma_client import get_vector_store
from app.core.logging import logger

def retrieve_relevant_chunks(session_id: str, query: str, k: int = 4) -> list[Document]:
    """
    Retrieve relevant resume chunks for a specific query from the session's vector store.
    No LLM calls are made here. Only retrieves documents.
    """
    logger.info(f"Retrieving top {k} relevant chunks for query in session {session_id}")
    try:
        db = get_vector_store(session_id)
        # Similarity search returning Document objects
        results = db.similarity_search(query, k=k)
        logger.info(f"Successfully retrieved {len(results)} chunks.")
        return results
    except Exception as e:
        logger.error(f"Failed to retrieve chunks from ChromaDB for session {session_id}: {str(e)}")
        raise e
