from pydantic import BaseModel

from trackline.core.fields import ResourceId
from trackline.users.models import User


class UserOut(BaseModel):
    id: ResourceId
    username: str

    @staticmethod
    def from_model(model: User) -> "UserOut":
        if not model.id:
            raise ValueError("ID is required")

        return UserOut(
            id=model.id,
            username=model.username,
        )
