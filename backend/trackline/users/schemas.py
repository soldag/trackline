from pydantic import BaseModel

from trackline.users.models import User


class UserOut(BaseModel):
    id: str
    username: str

    @staticmethod
    def from_model(model: User) -> "UserOut":
        return UserOut(
            id=model.id,
            username=model.username,
        )
