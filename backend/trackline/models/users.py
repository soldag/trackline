from trackline.models.base import IdentifiableModel


class User(IdentifiableModel):
    username: str
    password_hash: str
