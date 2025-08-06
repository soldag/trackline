from fastapi_injector import request_scope
from injector import Binder, Module, singleton

from trackline.games.services.music_brainz_lookup import MusicBrainzLookup
from trackline.games.services.notifications import NotificationChannelManager, Notifier


class GamesModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(Notifier, scope=request_scope)
        binder.bind(NotificationChannelManager, scope=singleton)
        binder.bind(MusicBrainzLookup, scope=singleton)
