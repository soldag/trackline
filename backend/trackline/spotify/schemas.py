from pydantic import BaseModel

from trackline.spotify.models import Track


class SpotifyAccessToken(BaseModel):
    access_token: str
    refresh_token: str


class TrackOut(BaseModel):
    spotify_id: str
    title: str
    artists: str
    release_year: int
    image_url: str | None

    @staticmethod
    def from_model(model: Track) -> "TrackOut":
        return TrackOut(
            spotify_id=model.spotify_id,
            title=model.title,
            artists=model.artists,
            release_year=model.release_year,
            image_url=model.image_url,
        )
