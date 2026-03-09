from pydantic import BaseModel


class SpotifyAccessTokenOut(BaseModel):
    access_token: str
    refresh_token: str
