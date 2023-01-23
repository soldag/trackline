from datetime import datetime

from pydantic import BaseModel

from trackline.models.auth import Session


class SessionOut(BaseModel):
    id: str
    user_id: str
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
