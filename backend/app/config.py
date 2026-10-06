"""
Application Configuration for SAP Supplier Decision Intelligence Platform.
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SAP Supplier Decision Intelligence Platform"
    VERSION: str = "1.0.0-POC"
    API_V1_STR: str = "/api"
    
    # Path settings
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    HISTORY_FILE: str = os.path.join(BASE_DIR, "data", "decision_audit_history.json")

    # Controlled artificial latency for realistic enterprise POC feel (Prompt Section 22)
    ENABLE_ARTIFICIAL_LATENCY: bool = True
    MIN_LATENCY_MS: int = 400
    MAX_LATENCY_MS: int = 1100

    # AI Configuration (Prompt Section 20, 21)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic_audit_synthesizer")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

settings = Settings()
