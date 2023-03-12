from trackline.core.db.models import IdentifiableModel


class User(IdentifiableModel):
    username: str
    password_hash: str
