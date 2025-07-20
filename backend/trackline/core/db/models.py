from typing import Self

from beanie import BulkWriter, Document
from beanie.odm.actions import ActionDirections
from pymongo.asynchronous.client_session import AsyncClientSession


class BaseDocument(Document):
    async def save_changes(
        self: Self,
        ignore_revision: bool = False,  # noqa: FBT001, FBT002
        session: AsyncClientSession | None = None,
        bulk_writer: BulkWriter | None = None,
        skip_actions: list[ActionDirections | str] | None = None,
    ) -> Self | None:
        if session is None:
            raise ValueError("Session is required")

        return await super().save_changes(
            ignore_revision=ignore_revision,
            session=session,
            bulk_writer=bulk_writer,
            skip_actions=skip_actions,
        )

    class Settings:
        use_state_management = True
