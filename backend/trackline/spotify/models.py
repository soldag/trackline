from pydantic import BaseModel


class Track(BaseModel):
    spotify_id: str
    title: str
    artists: str
    release_year: int
    image_url: str | None
