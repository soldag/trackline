from typing import Annotated

from beanie import PydanticObjectId
from pydantic import Field

Fraction = Annotated[float, Field(ge=0, le=1)]


ResourceId = PydanticObjectId
