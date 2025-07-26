from enum import StrEnum

from pydantic import BaseModel


class SpotifyProduct(StrEnum):
    FREE = "free"
    PREMIUM = "premium"


class SpotifyTrack(BaseModel):
    id: str
    artists: list[str]
    title: str
    release_year: int | None = None
    is_playable: bool
    image_url: str | None = None


class SpotifyUser(BaseModel):
    id: str
    product: SpotifyProduct | None
