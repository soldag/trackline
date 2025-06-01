from injector import Inject
from pydantic import BaseModel

from trackline.core.db.repository import Repository
from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.users.models import User
from trackline.users.schemas import UserOut


class GetCurrentUser(BaseModel):
    class Handler:
        def __init__(self, repository: Inject[Repository]) -> None:
            self._repository = repository

        async def execute(
            self, user_id: ResourceId, use_case: "GetCurrentUser"
        ) -> UserOut:
            user = await self._repository.get(User, user_id)
            if not user:
                raise UseCaseException(
                    code="USER_NOT_FOUND",
                    message="The user does not exist.",
                    status_code=404,
                )

            return UserOut.from_model(user)
