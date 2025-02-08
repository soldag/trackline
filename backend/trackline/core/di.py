from injector import Binder, Module, singleton

from trackline.core.db.client import DatabaseClient
from trackline.core.settings import get_settings, Settings


class CoreModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(
            Settings,
            to=get_settings(),
            scope=singleton,
        )
        binder.bind(DatabaseClient, scope=singleton)
