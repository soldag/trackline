from injector import Inject
from pydantic import BaseModel

from trackline.auth.repository import SessionRepository
from trackline.core.fields import ResourceId


class GetSessionUser(BaseModel):
    token: str

    class Handler:
        def __init__(self, session_repository: Inject[SessionRepository]) -> None:
            self._session_repository = session_repository

        async def execute(self, use_case: "GetSessionUser") -> ResourceId | None:
            session = await self._session_repository.find_one({"token": use_case.token})
            return session.user_id if session else None
