from injector import Inject
from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.auth.repository import SessionRepository
from trackline.auth.schemas import SessionOut
from trackline.core.exceptions import UseCaseException
from trackline.core.utils.security import verify_password
from trackline.users.repository import UserRepository


class CreateSession(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(
            self,
            session_repository: Inject[SessionRepository],
            user_repository: Inject[UserRepository],
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
