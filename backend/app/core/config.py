import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_FOLDER: str = "uploads"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # AI Providers Configuration
    GROQ_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GOOGLE_EMBEDDING_MODEL: str = "models/text-embedding-004"
    
    # Storage Configuration
    STORAGE_FOLDER: str = "storage"
    
    # Configure loading settings from .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def BASE_DIR(self) -> Path:
        # File is backend/app/core/config.py -> core -> app -> backend
        return Path(__file__).resolve().parent.parent.parent

    @property
    def UPLOAD_DIR(self) -> Path:
        return self.BASE_DIR / self.UPLOAD_FOLDER

    @property
    def STORAGE_DIR(self) -> Path:
        return self.BASE_DIR / self.STORAGE_FOLDER

settings = Settings()
