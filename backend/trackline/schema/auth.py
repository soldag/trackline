from datetime import datetime

from pydantic import BaseModel


class SessionOut(BaseModel):
    id: str
    user_id: str
    token: str
    creation_date: datetime
    expiration_date: datetime
