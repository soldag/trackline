from fastapi_injector import request_scope
from injector import Binder, Module, provider, singleton

from trackline.core.db.client import DatabaseClient
from trackline.core.db.unit_of_work import UnitOfWork
from trackline.core.notifications.channel_manager import NotificationChannelManager
from trackline.core.notifications.notifier import Notifier
from trackline.core.settings import Settings, get_settings


class CoreModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(DatabaseClient, scope=singleton)
        binder.bind(UnitOfWork, scope=request_scope)

        binder.bind(NotificationChannelManager, scope=singleton)
        binder.bind(Notifier, scope=request_scope)

    @singleton
    @provider
    def provide_settings(self) -> Settings:
        return get_settings()
