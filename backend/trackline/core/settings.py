from pydantic import BaseSettings


class Settings(BaseSettings):
    app_contact_email: str | None = None

    db_uri: str = "mongodb://localhost:27017"
    db_name: str = "trackline"
    db_txn_retries_max: int = 3
    db_txn_retries_min_interval: int = 100
    db_txn_retries_jitter: int = 50

    spotify_client_id: str
    spotify_client_secret: str
    spotify_redirect_url: str
