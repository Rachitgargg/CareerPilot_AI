from groq import Groq
from app.core.config import settings
from app.core.logging import logger

class GroqClient:
    def __init__(self):
        self._client = None

    @property
    def client(self) -> Groq:
        if self._client is None:
            if not settings.GROQ_API_KEY:
                logger.error("GROQ_API_KEY is not set in settings!")
                raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file.")
            self._client = Groq(api_key=settings.GROQ_API_KEY)
        return self._client

    def get_completion(
        self,
        messages: list,
        response_format: dict = None,
        temperature: float = 0.1,
    ) -> str:
        """
        Generates chat completion using Groq LLM.
        """
        try:
            logger.info(f"Invoking Groq API model={settings.GROQ_MODEL}")
            kwargs = {
                "model": settings.GROQ_MODEL,
                "messages": messages,
                "temperature": temperature,
            }
            if response_format:
                kwargs["response_format"] = response_format

            # API Call
            response = self.client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            logger.info("Groq API completion call completed successfully.")
            return content
        except Exception as e:
            logger.error(f"Groq chat completion failed: {str(e)}")
            raise e

groq_client = GroqClient()
