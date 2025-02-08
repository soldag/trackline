from injector import Inject
from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.core.db.client import DatabaseClient
from trackline.core.exceptions import UseCaseException


class DeleteSession(BaseModel):
    token: str

    class Handler:
        def __init__(self, db: Inject[DatabaseClient]) -> None:
            self._db = db

        async def execute(self, use_case: "DeleteSession") -> None:
            result = await Session.find_one({"token": use_case.token}).delete(
                session=self._db.session
            )
            if not result or result.deleted_count == 0:
                raise UseCaseException("INVALID_TOKEN", "The session token is invalid.")
