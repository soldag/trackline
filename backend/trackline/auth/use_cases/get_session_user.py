from pydantic import BaseModel

from trackline.auth.repository import SessionRepository


class GetSessionUser(BaseModel):
    token: str

    class Handler:
        def __init__(self, session_repository: SessionRepository) -> None:
            self._session_repository = session_repository

        async def execute(self, use_case: "GetSessionUser") -> str | None:
            session = await self._session_repository.find_one({"token": use_case.token})
            return str(session.user_id) if session else None
