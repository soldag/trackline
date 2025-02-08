from trackline.core.db.models import BaseDocument


class User(BaseDocument):
    username: str
    password_hash: str

    class Settings(BaseDocument.Settings):
        name = "user"
