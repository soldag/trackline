from injector import Inject
from pydantic import BaseModel

from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.users.schemas import UserOut
from trackline.users.services.repository import UserRepository


class GetCurrentUser(BaseModel):
    class Handler:
        def __init__(self, user_repository: Inject[UserRepository]) -> None:
            self._user_repository = user_repository

        async def execute(
            self, user_id: ResourceId, use_case: "GetCurrentUser"
        ) -> UserOut:
            user = await self._user_repository.find_by_id(user_id)
            if not user:
                raise UseCaseException(
                    code="USER_NOT_FOUND",
                    message="The user does not exist.",
                    status_code=404,
                )

            return UserOut.from_model(user)
