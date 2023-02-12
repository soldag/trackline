from pydantic import BaseModel

from trackline.models.base import StringId
from trackline.models.users import User


class UserOut(BaseModel):
    id: StringId
    username: str

    @staticmethod
    def from_model(model: User) -> "UserOut":
        return UserOut(
            id=model.id,
            username=model.username,
        )
