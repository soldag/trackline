from injector import Inject
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseException
from trackline.core.utils.security import hash_password
from trackline.users.models import User
from trackline.users.schemas import UserOut


class CreateUser(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(self, repository: Inject[Repository]) -> None:
            self._repository = repository

        async def execute(self, use_case: "CreateUser") -> UserOut:
            user = User(
                username=use_case.username,
                password_hash=hash_password(use_case.password),
            )

            try:
                await self._repository.create(user)
            except DuplicateKeyError:
                raise UseCaseException(
                    code="USERNAME_EXISTS",
                    message="A user with this username already exists.",
                    status_code=400,
                )

            return UserOut.from_model(user)
