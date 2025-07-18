import secrets
from datetime import datetime

from pydantic import Field

from trackline.auth.constants import SESSION_EXPIRY_INTERVAL, SESSION_TOKEN_LENGTH
from trackline.core.db.models import BaseDocument
from trackline.core.fields import ResourceId
from trackline.core.utils.datetime import utcnow


def get_default_expiration_time() -> datetime:
    return utcnow() + SESSION_EXPIRY_INTERVAL


def generate_token() -> str:
    return secrets.token_urlsafe(SESSION_TOKEN_LENGTH)


class Session(BaseDocument):
    user_id: ResourceId
    token: str = Field(default_factory=generate_token)
    creation_time: datetime = Field(default_factory=utcnow)
    expiration_time: datetime = Field(default_factory=get_default_expiration_time)

    class Settings(BaseDocument.Settings):
        name = "session"
