from injector import Inject
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError

from trackline.core.db.client import DatabaseClient
from trackline.core.exceptions import UseCaseException
from trackline.core.utils.security import hash_password
from trackline.users.models import User
from trackline.users.schemas import UserOut


class CreateUser(BaseModel):
    username: str
    password: str

    class Handler:
        def __init__(self, db: Inject[DatabaseClient]) -> None:
            self._db = db

        async def execute(self, use_case: "CreateUser") -> UserOut:
            user = User(
                username=use_case.username,
                password_hash=hash_password(use_case.password),
            )

            try:
                await user.create(session=self._db.session)
            except DuplicateKeyError:
                raise UseCaseException(
                    code="USERNAME_EXISTS",
                    message="A user with this username already exists.",
                    status_code=400,
                )

            return UserOut.from_model(user)
