from injector import Inject
from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.core.db.client import DatabaseClient
from trackline.core.fields import ResourceId


class GetSessionUser(BaseModel):
    token: str

    class Handler:
        def __init__(self, db: Inject[DatabaseClient]) -> None:
            self._db = db

        async def execute(self, use_case: "GetSessionUser") -> ResourceId | None:
            session = await Session.find_one(
                {"token": use_case.token},
                session=self._db.session,
            )
            return session.user_id if session else None
