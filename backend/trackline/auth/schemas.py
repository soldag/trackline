from datetime import datetime

from trackline.auth.models import Session
from trackline.core.fields import ResourceId
from trackline.core.schemas import BaseSchema


class SessionOut(BaseSchema):
    id: ResourceId
    user_id: ResourceId
    token: str
    creation_date: datetime
    expiration_date: datetime

    @staticmethod
    def from_model(model: Session) -> "SessionOut":
        return SessionOut(
            id=model.id,
            user_id=model.user_id,
            token=model.token,
            creation_date=model.creation_date,
            expiration_date=model.expiration_date,
        )
