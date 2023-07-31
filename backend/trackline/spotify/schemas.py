from pydantic import BaseModel


class SpotifyAccessToken(BaseModel):
    access_token: str
    refresh_token: str
