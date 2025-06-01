from enum import Enum
import os

from pydantic import PositiveInt
from pydantic_settings import BaseSettings


class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class Settings(BaseSettings):
    app_contact_email: str | None = None

    log_level: LogLevel = LogLevel.INFO

    host: str = "0.0.0.0"
    port: PositiveInt = 8000
    reload: bool = False

    db_uri: str = "mongodb://localhost:27017"
    db_name: str = "trackline"
    db_txn_retries_max_attempts: PositiveInt = 3
    db_txn_retries_min_interval: PositiveInt = 100
    db_txn_retries_jitter: PositiveInt = 50

    spotify_client_id: str
    spotify_client_secret: str
    spotify_redirect_url: str

    sentry_dsn: str | None = None


def get_settings() -> Settings:
    environment = os.getenv("ENVIRONMENT", "production").lower()
    return Settings(_env_file=(".env", f".env.{environment}"))  # type: ignore[call-arg]
