from pydantic import BaseModel

from trackline.models.users import User
from trackline.schema.users import UserOut
from trackline.services.repositories import UserRepository
from trackline.utils.exceptions import UseCaseException
from trackline.utils.security import hash_password


class CreateUser(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(self, user_repository: UserRepository) -> None:
            self._user_repository = user_repository

        async def execute(self, use_case: "CreateUser") -> UserOut:
            user = User(
                username=use_case.username,
                password_hash=hash_password(use_case.password),
            )
            await self._user_repository.create(user)

            return UserOut.from_model(user)


class GetCurrentUser(BaseModel):
    class Handler:
        def __init__(self, user_repository: UserRepository) -> None:
            self._user_repository = user_repository

        async def execute(self, user_id: str, use_case: "GetCurrentUser") -> UserOut:
            user = await self._user_repository.find_by_id(user_id)
            if not user:
                raise UseCaseException(
                    code="USER_NOT_FOUND",
                    description="The user does not exist.",
                    status_code=404,
                )

            return UserOut.from_model(user)
