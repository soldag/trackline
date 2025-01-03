from injector import Inject
from pydantic import BaseModel

from trackline.auth.services.repository import SessionRepository
from trackline.core.exceptions import UseCaseException


class DeleteSession(BaseModel):
    token: str

    class Handler:
        def __init__(self, session_repository: Inject[SessionRepository]) -> None:
            self._session_repository = session_repository

        async def execute(self, use_case: "DeleteSession") -> None:
            if not await self._session_repository.delete_one({"token": use_case.token}):
                raise UseCaseException("INVALID_TOKEN", "The session token is invalid.")
