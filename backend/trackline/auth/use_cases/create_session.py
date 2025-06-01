from injector import Inject
from pydantic import BaseModel

from trackline.auth.models import Session
from trackline.auth.schemas import SessionOut
from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseException
from trackline.core.utils.security import verify_password
from trackline.users.models import User


class CreateSession(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(self, repository: Inject[Repository]) -> None:
            self._repository = repository

        async def execute(self, use_case: "CreateSession") -> SessionOut:
            user = await self._repository.get_one(User, {"username": use_case.username})
            if not user or not user.id:
                raise UseCaseException(
                    code="WRONG_CREDENTIALS",
                    message="The credentials are incorrect.",
                    status_code=400,
                )

            password_correct, new_hash = verify_password(
                use_case.password, user.password_hash
            )
            if new_hash:
                user.password_hash = new_hash
            if not password_correct:
                raise UseCaseException(
                    code="WRONG_CREDENTIALS",
                    message="The credentials are incorrect.",
                    status_code=400,
                )

            session = Session(user_id=user.id)
            await self._repository.create(session)

            return SessionOut.from_model(session)
