from datetime import datetime
import secrets

from pydantic import Field

from trackline.constants import SESSION_EXPIRY_INTERVAL, SESSION_TOKEN_LENGTH
from trackline.core.db.models import IdentifiableModel
from trackline.core.fields import ResourceId
from trackline.core.utils.datetime import utcnow


def get_default_expiration_time():
    return utcnow() + SESSION_EXPIRY_INTERVAL


def generate_token():
    return secrets.token_urlsafe(SESSION_TOKEN_LENGTH)


class Session(IdentifiableModel):
    user_id: ResourceId
    token: str = Field(default_factory=generate_token)
    creation_time: datetime = Field(default_factory=utcnow)
    expiration_time: datetime = Field(default_factory=get_default_expiration_time)
