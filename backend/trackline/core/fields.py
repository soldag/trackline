from typing import Annotated

from beanie import PydanticObjectId
from pydantic import Field, StringConstraints

Fraction = Annotated[float, Field(ge=0, le=1)]

NonEmptyStr = Annotated[
    str,
    StringConstraints(min_length=1, strip_whitespace=True),
]

ResourceId = PydanticObjectId
