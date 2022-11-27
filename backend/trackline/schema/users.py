from pydantic import BaseModel

from trackline.models.base import StringId


class UserOut(BaseModel):
    id: StringId
    username: str
