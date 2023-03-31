from typing import List

from pydantic import BaseModel


class SpotifyTrack(BaseModel):
    id: str
    artists: List[str]
    title: str
    release_year: int | None
    is_playable: bool
    image_url: str | None
