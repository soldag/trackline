from injector import Binder, Module, singleton

from trackline.games.services.music_brainz_lookup import MusicBrainzLookup


class GamesModule(Module):
    def configure(self, binder: Binder) -> None:
        binder.bind(MusicBrainzLookup, scope=singleton)
