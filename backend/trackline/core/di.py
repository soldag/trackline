import os

from fastapi_injector import request_scope
from injector import Binder, Module, singleton

from trackline.core.db.client import DatabaseClient
from trackline.core.settings import Settings


ENVIRONMENT = os.getenv("ENVIRONMENT", "production").lower()


class CoreModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(
            Settings,
            to=Settings(_env_file=(".env", f".env.{ENVIRONMENT}")),  # type: ignore
            scope=singleton,
        )
        binder.bind(DatabaseClient, scope=request_scope)
