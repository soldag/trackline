from pymongo.errors import DuplicateKeyError

from trackline.core.db.repository import Repository
from trackline.users.models import User


class UsernameExistsError(ValueError):
    pass


class UserRepository(Repository[User]):
    class Meta:
        collection_name = "user"

    async def create(self, model: User) -> None:
        try:
            return await super().create(model)
        except DuplicateKeyError as exc:
            key_pattern = exc.details and exc.details.get("keyPattern")
            if key_pattern and key_pattern.get("username") == 1:
                raise UsernameExistsError() from exc

            raise
