from injector import Inject
from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId


class GetSessionUser(BaseModel):
    token: str

    class Handler:
        def __init__(self, repository: Inject[Repository]) -> None:
            self._repository = repository

        async def execute(self, use_case: "GetSessionUser") -> ResourceId | None:
            session = await self._repository.get_one(Session, {"token": use_case.token})
            return session.user_id if session else None
