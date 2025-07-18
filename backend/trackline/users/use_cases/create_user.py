from injector import inject
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseError
from trackline.core.utils.security import hash_password
from trackline.users.models import User
from trackline.users.schemas import UserOut


class CreateUser(BaseModel):
    username: str
    password: str

    class Handler:
        @inject
        def __init__(self, repository: Repository) -> None:
            self._repository = repository

        async def execute(self, use_case: "CreateUser") -> UserOut:
            user = User(
                username=use_case.username,
                password_hash=hash_password(use_case.password),
            )

            try:
                await self._repository.create(user)
            except DuplicateKeyError as e:
                raise UseCaseError(
                    code="USERNAME_EXISTS",
                    message="A user with this username already exists.",
                    status_code=400,
                ) from e

            return UserOut.from_model(user)
