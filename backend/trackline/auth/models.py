from datetime import datetime
import secrets

from pydantic import Field

from trackline.configuration import SESSION_EXPIRY_INTERVAL
from trackline.constants import SESSION_TOKEN_LENGTH
from trackline.core.db.models import IdentifiableModel, StringId
from trackline.core.utils.datetime import utcnow


def get_default_expiration_date():
    return utcnow() + SESSION_EXPIRY_INTERVAL


def generate_token():
    return secrets.token_urlsafe(SESSION_TOKEN_LENGTH)


class Session(IdentifiableModel):
    user_id: StringId
    token: str = Field(default_factory=generate_token)
    creation_date: datetime = Field(default_factory=utcnow)
    expiration_date: datetime = Field(default_factory=get_default_expiration_date)
