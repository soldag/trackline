from pydantic import BaseModel

from trackline.models.auth import Session
from trackline.schema.auth import SessionOut
from trackline.services.repositories import SessionRepository, UserRepository
from trackline.utils.exceptions import UseCaseException
from trackline.utils.security import verify_password


class CreateSession(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(
            self,
            session_repository: SessionRepository,
            user_repository: UserRepository,
        ) -> None:
            self._session_repository = session_repository
            self._user_repository = user_repository

        async def execute(self, use_case: "CreateSession") -> SessionOut:
            user = await self._user_repository.find_one({"username": use_case.username})
            if not user:
                raise UseCaseException(
                    code="WRONG_CREDENTIALS",
                    description="The credentials are incorrect.",
                    status_code=400,
                )

            password_correct, new_hash = verify_password(
                use_case.password, user.password_hash
            )
            if new_hash:
                await self._user_repository.update_by_id(
                    user.id,
                    {"password_hash": new_hash},
                )
            if not password_correct:
                raise UseCaseException(
                    code="WRONG_CREDENTIALS",
                    description="The credentials are incorrect.",
                    status_code=400,
                )

            session = Session(user_id=user.id)
            await self._session_repository.create(session)

            return SessionOut.from_model(session)


class DeleteSession(BaseModel):
    token: str

    class Handler:
        def __init__(self, session_repository: SessionRepository) -> None:
            self._session_repository = session_repository

        async def execute(self, use_case: "DeleteSession") -> None:
            if not await self._session_repository.delete_one({"token": use_case.token}):
                raise UseCaseException("INVALID_TOKEN", "The session token is invalid.")


class GetSessionUser(BaseModel):
    token: str

    class Handler:
        def __init__(self, session_repository: SessionRepository) -> None:
            self._session_repository = session_repository

        async def execute(self, use_case: "GetSessionUser") -> str | None:
            session = await self._session_repository.find_one({"token": use_case.token})
            return str(session.user_id) if session else None
