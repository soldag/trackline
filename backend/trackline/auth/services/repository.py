from collections.abc import Mapping
from typing import Any

from trackline.auth.models import Session
from trackline.core.db.repository import Repository
from trackline.core.utils.datetime import utcnow


class SessionRepository(Repository[Session]):
    class Meta:
        collection_name = "sessions"

    def _transform_query(self, query: Mapping[str, Any]) -> Mapping[str, Any]:
        query = super()._transform_query(query)

        # Always exclude expired sessions
        query = {
            **query,
            "expiration_time": {
                **query.get("expiration_time", {}),
                "$gt": utcnow(),
            },
        }

        return query
