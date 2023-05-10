from injector import Binder, Module, singleton

from trackline.games.music_brainz import MusicBrainzClient
from trackline.games.notifier import Notifier


class GamesModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(Notifier, scope=singleton)
        binder.bind(MusicBrainzClient, scope=singleton)
