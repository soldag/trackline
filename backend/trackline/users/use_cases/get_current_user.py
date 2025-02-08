from injector import Inject
from pydantic import BaseModel

from trackline.core.db.client import DatabaseClient
from trackline.core.exceptions import UseCaseException
from trackline.core.fields import ResourceId
from trackline.users.models import User
from trackline.users.schemas import UserOut


class GetCurrentUser(BaseModel):
    class Handler:
        def __init__(self, db: Inject[DatabaseClient]) -> None:
            self._db = db

        async def execute(
            self, user_id: ResourceId, use_case: "GetCurrentUser"
        ) -> UserOut:
            user = await User.get(user_id, session=self._db.session)
            if not user:
                raise UseCaseException(
                    code="USER_NOT_FOUND",
                    message="The user does not exist.",
                    status_code=404,
                )

            return UserOut.from_model(user)
