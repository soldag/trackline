from pydantic import BaseModel

from trackline.core.utils import to_snake_case


class Notification(BaseModel):
    def get_type(self) -> str:
        return to_snake_case(self.__class__.__name__)
