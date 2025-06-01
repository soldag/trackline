from injector import Inject
from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseException


class DeleteSession(BaseModel):
    token: str

    class Handler:
        def __init__(self, repository: Inject[Repository]) -> None:
            self._repository = repository

        async def execute(self, use_case: "DeleteSession") -> None:
            result = await self._repository.delete_many(
                Session, {"token": use_case.token}
            )
            if not result or result.deleted_count == 0:
                raise UseCaseException("INVALID_TOKEN", "The session token is invalid.")
