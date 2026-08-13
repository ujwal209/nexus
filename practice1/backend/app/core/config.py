import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS AI Studio Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # MONGODB SETTINGS
    MONGODB_URI: str = "mongodb+srv://ujwal:ujwaluj1@cluster0.p4qtaj2.mongodb.net/"
    DATABASE_NAME: str = "nexus"

    # API KEYS
    TAVILY_API_KEYS: str = ""
    GROQ_API_KEYS: str = ""

    # SMTP SETTINGS
    EMAIL_WORKER: str = ""
    APP_PASSWORD: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
