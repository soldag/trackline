from injector import Binder, Module, singleton

from trackline.games.services.music_brainz import MusicBrainzClient
from trackline.games.services.notifier import Notifier


class GamesModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(Notifier, scope=singleton)
        binder.bind(MusicBrainzClient, scope=singleton)
