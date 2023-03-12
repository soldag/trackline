from trackline.core.db.repository import Repository
from trackline.users.models import User


class UserRepository(Repository[User]):
    class Meta:
        collection_name = "user"
