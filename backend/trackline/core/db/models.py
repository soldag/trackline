import pydantic

from trackline.core.fields import ResourceId


class BaseModel(pydantic.BaseModel):
    class Config:
        frozen = True


class IdentifiableModel(BaseModel):
    id: ResourceId = pydantic.Field(default_factory=ResourceId)
