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
        Generates chat completion using Groq LLM with robust fallback models on rate limits/429.
        """
        primary_model = settings.GROQ_MODEL
        fallback_models = [
            primary_model,
            "llama-3.1-70b-versatile",
            "mixtral-8x7b-32768",
            "llama-3.1-8b-instant",
            "llama3-8b-8192"
        ]
        
        models_to_try = []
        for m in fallback_models:
            if m and m not in models_to_try:
                models_to_try.append(m)
                
        last_error = None
        for model in models_to_try:
            try:
                logger.info(f"Invoking Groq API model={model}")
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                }
                if response_format:
                    kwargs["response_format"] = response_format

                response = self.client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
                logger.info(f"Groq API completion call completed successfully using model={model}.")
                return content
            except Exception as e:
                err_msg = str(e).lower()
                is_rate_limit = (
                    "rate_limit" in err_msg or 
                    "429" in err_msg or 
                    "rate limit" in err_msg or 
                    "limit reached" in err_msg or 
                    type(e).__name__ == "RateLimitError"
                )
                if is_rate_limit:
                    logger.warning(f"Rate limit or 429 hit for model {model}. Error: {str(e)}. Trying next fallback...")
                    last_error = e
                    continue
                else:
                    logger.error(f"Groq chat completion failed for model {model} with non-rate-limit error: {str(e)}")
                    raise e
                    
        logger.error(f"All Groq fallback models exhausted. Final error: {str(last_error)}")
        raise last_error

groq_client = GroqClient()
