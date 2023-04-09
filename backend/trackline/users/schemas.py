from trackline.core.fields import ResourceId
from trackline.core.schemas import BaseSchema
from trackline.users.models import User


class UserOut(BaseSchema):
    id: ResourceId
    username: str

    @staticmethod
    def from_model(model: User) -> "UserOut":
        return UserOut(
            id=model.id,
            username=model.username,
        )
