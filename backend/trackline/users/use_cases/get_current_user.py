from pydantic import BaseModel


from trackline.core.exceptions import UseCaseException
from trackline.users.repository import UserRepository
from trackline.users.schemas import UserOut


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
