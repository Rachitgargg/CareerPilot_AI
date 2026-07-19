from app.schemas.career_profile import CareerProfile
from app.services.llm.embedding_client import embedding_client

def extract_resume_profile(text: str) -> CareerProfile:
    """
    Extract structured CareerProfile from raw resume text using Groq LLM.
    Downstream business logic calls this instead of calling groq_client directly.
    """
    from app.services.resume.resume_extractor import extract_career_profile
    return extract_career_profile(text)

def get_embeddings_instance():
    """
    Get the underlying LangChain GoogleGenAIEmbeddings client instance.
    Used by vector store layer.
    """
    return embedding_client.embeddings
