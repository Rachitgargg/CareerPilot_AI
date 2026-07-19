from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings
from app.core.logging import logger

class EmbeddingClient:
    def __init__(self):
        self._embeddings = None

    @property
    def embeddings(self) -> GoogleGenerativeAIEmbeddings:
        if self._embeddings is None:
            if not settings.GOOGLE_API_KEY:
                logger.error("GOOGLE_API_KEY is not set in settings!")
                raise ValueError("GOOGLE_API_KEY is not set. Please add it to your .env file.")
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model=settings.GOOGLE_EMBEDDING_MODEL,
                google_api_key=settings.GOOGLE_API_KEY
            )
        return self._embeddings

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """
        Embed lists of documents/texts using Google Gemini.
        """
        try:
            logger.info(f"Generating embeddings for {len(texts)} chunks...")
            return self.embeddings.embed_documents(texts)
        except Exception as e:
            logger.error(f"Gemini embed_documents failed: {str(e)}")
            raise e

    def embed_query(self, text: str) -> list[float]:
        """
        Embed a single search query text.
        """
        try:
            return self.embeddings.embed_query(text)
        except Exception as e:
            logger.error(f"Gemini embed_query failed: {str(e)}")
            raise e

embedding_client = EmbeddingClient()
