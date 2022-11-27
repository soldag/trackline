import pydantic

from trackline.utils.fields import StringId


class BaseModel(pydantic.BaseModel):
    class Config:
        frozen = True


class IdentifiableModel(BaseModel):
    id: StringId = pydantic.Field(default_factory=StringId)
