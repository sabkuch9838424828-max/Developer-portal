import os
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXORA"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Application Environment
    APP_ENV: str = "development"
    
    # Security
    SECRET_KEY: str = "nexora-super-secret-production-key-2026-secure-token-hash-entropy-salt"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./nexora.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Configuration
    AI_PROVIDER: str = "gemini"  # "gemini" or "grok"
    GEMINI_API_KEY: Optional[str] = ""
    GROK_API_KEY: Optional[str] = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"
    GROK_MODEL: str = "grok-beta"
    
    AI_TIMEOUT: int = 60
    AI_MAX_RETRIES: int = 3
    AI_TEMPERATURE: float = 0.1
    AI_FEATURES_ENABLED: bool = True
    
    # Matching Engine Parameters
    MATCH_THRESHOLD: int = 75
    WEIGHT_MANDATORY_SKILLS: float = 0.40
    WEIGHT_PREFERRED_SKILLS: float = 0.20
    WEIGHT_RELEVANT_PROJECTS: float = 0.20
    WEIGHT_EXPERIENCE: float = 0.10
    WEIGHT_AVAILABILITY_PREFERENCE: float = 0.10
    
    # Storage & Uploads
    STORAGE_BACKEND: str = "local"
    STORAGE_DIR: str = "./storage/uploads"
    MAX_UPLOAD_SIZE_MB: int = 15
    MAX_FILE_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "png", "jpg", "jpeg"]
    
    # Email (Optional)
    EMAIL_PROVIDER: Optional[str] = ""
    EMAIL_API_KEY: Optional[str] = ""
    EMAIL_FROM: Optional[str] = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v):
        if not v or not str(v).strip() or len(str(v).strip()) < 16:
            return "nexora-super-secret-production-key-2026-secure-token-hash-entropy-salt"
        return str(v).strip()

    @field_validator("GEMINI_MODEL", mode="before")
    @classmethod
    def validate_gemini_model(cls, v):
        return str(v).strip() if (v and str(v).strip()) else "gemini-1.5-pro"

    @field_validator("GROK_MODEL", mode="before")
    @classmethod
    def validate_grok_model(cls, v):
        return str(v).strip() if (v and str(v).strip()) else "grok-beta"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_db_url(cls, v):
        return str(v).strip() if (v and str(v).strip()) else "sqlite:///./nexora.db"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
