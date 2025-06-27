from injector import Binder, Module, singleton

from trackline.games.services.music_brainz_lookup import MusicBrainzLookup
from trackline.games.services.notifier import Notifier


class GamesModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(Notifier, scope=singleton)
        binder.bind(MusicBrainzLookup, scope=singleton)
