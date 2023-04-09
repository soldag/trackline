from trackline.core.schemas import BaseSchema


class SpotifyAccessToken(BaseSchema):
    access_token: str
    refresh_token: str
