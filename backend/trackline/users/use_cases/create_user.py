from injector import Inject
from pydantic import BaseModel

from trackline.core.utils.security import hash_password
from trackline.users.models import User
from trackline.users.repository import UserRepository
from trackline.users.schemas import UserOut


class CreateUser(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(self, user_repository: Inject[UserRepository]) -> None:
            self._user_repository = user_repository

        async def execute(self, use_case: "CreateUser") -> UserOut:
            user = User(
                username=use_case.username,
                password_hash=hash_password(use_case.password),
            )
            await self._user_repository.create(user)

            return UserOut.from_model(user)
