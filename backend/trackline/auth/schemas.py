from datetime import datetime

from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.core.fields import ResourceId


class SessionOut(BaseModel):
    id: ResourceId
    user_id: ResourceId
    token: str
    creation_time: datetime
    expiration_time: datetime

    @staticmethod
    def from_model(model: Session) -> "SessionOut":
        return SessionOut(
            id=model.id,
            user_id=model.user_id,
            token=model.token,
            creation_time=model.creation_time,
            expiration_time=model.expiration_time,
        )
