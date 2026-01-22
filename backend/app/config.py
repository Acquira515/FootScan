"""Configuration management for the football prediction app."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ENV_FILE = Path(__file__).parent.parent.parent / ".env"
if not ENV_FILE.exists():
    ENV_FILE = Path(__file__).parent / ".env"
load_dotenv(ENV_FILE)


class Config:
    """Base configuration."""

    # API Keys
    FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY", "")
    FOOTBALL_API_BASE_URL = os.getenv(
        "FOOTBALL_API_BASE_URL", "https://api.football-data.org/v4"
    )
    NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
    NEWS_API_BASE_URL = os.getenv(
        "NEWS_API_BASE_URL", "https://newsapi.org/v2"
    )
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    LLM_API_BASE_URL = os.getenv(
        "LLM_API_BASE_URL", "https://api.openai.com/v1"
    )
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-mini")

    # League Configuration
    DEFAULT_LEAGUE_ID = int(os.getenv("DEFAULT_LEAGUE_ID", "2790"))

    # Cache Configuration
    CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "3600"))

    # Database
    DATABASE_PATH = os.getenv(
        "DATABASE_PATH",
        str(Path(__file__).parent.parent.parent / "football_predictions.db")
    )

    # Server
    API_HOST = os.getenv("API_HOST", "127.0.0.1")
    API_PORT = int(os.getenv("API_PORT", "5000"))

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "app.log")

    # Development
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

    # Request timeout
    REQUEST_TIMEOUT = 10

    # Max retries
    MAX_RETRIES = 3

    # Backtest parameters
    BACKTEST_START_DATE = "2023-01-01"
    BACKTEST_END_DATE = "2024-12-31"
    BACKTEST_MIN_MATCHES = 100

    @classmethod
    def validate(cls):
        """Validate essential configuration."""
        if not cls.FOOTBALL_API_KEY:
            print("Warning: FOOTBALL_API_KEY not set")
        if not cls.LLM_API_KEY:
            print("Warning: LLM_API_KEY not set")
