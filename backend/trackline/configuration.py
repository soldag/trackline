from datetime import timedelta
import os

from dotenv import load_dotenv


load_dotenv()
if env := os.getenv("ENVIRONMENT", "production"):
    load_dotenv(f".env.{env}")

APP_CONTACT_EMAIL = os.getenv("APP_CONTACT_EMAIL")

DB_URI = os.getenv("DB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "trackline")
DB_TXN_RETRIES_MAX = int(os.getenv("DB_TXN_RETRY_MAX", 3))
DB_TXN_RETRIES_MIN_INTERVAL = int(os.getenv("DB_TXN_RETRY_MIN_INTERVAL", 100))
DB_TXN_RETRIES_JITTER = int(os.getenv("DB_TXN_RETRY_JITTER", 50))

SESSION_EXPIRY_INTERVAL = timedelta(
    hours=int(os.getenv("SESSION_EXPIRY_INTERVAL", 168))
)

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URL = os.getenv("SPOTIFY_REDIRECT_URL")
