from typing import Mapping

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.games.models import Game, Guess, Player, Track, Turn, TurnScoring


class GameRepository(Repository[Game]):
    class Meta:
        collection_name = "games"

    async def add_player(self, game_id: ResourceId, player: Player) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {"$push": {"players": self._to_document(player, root=False)}},
        )

    async def remove_player(self, game_id: ResourceId, user_id: ResourceId) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {"$pull": {"players": {"user_id": user_id}}},
        )

    async def add_turn(self, game_id: ResourceId, turn: Turn) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {"$push": {"turns": self._to_document(turn, root=False)}},
        )

    async def replace_turn(self, game_id: ResourceId, turn_id: int, turn: Turn) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {"$set": {f"turns.{turn_id}": self._to_document(turn, root=False)}},
        )

    async def exchange_track(
        self, game_id: ResourceId, turn_id: int, old_track_id: str, track: Track
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$set": {
                    f"turns.{turn_id}.track": self._to_document(track, root=False),
                    f"turns.{turn_id}.guesses": {},
                },
                "$push": {
                    "discarded_track_ids": old_track_id,
                },
            },
        )

    async def add_guess(
        self, game_id: ResourceId, turn_id: int, user_id: ResourceId, guess: Guess
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$set": {
                    f"turns.{turn_id}.guesses.{user_id}": self._to_document(
                        guess, root=False
                    )
                }
            },
        )

    async def set_turn_scoring(
        self, game_id: ResourceId, turn_id: int, scoring: TurnScoring
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$set": {
                    f"turns.{turn_id}.scoring": self._to_document(scoring, root=False),
                },
            },
        )

    async def add_turn_completed_by(
        self, game_id: ResourceId, turn_id: int, user_id: ResourceId
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$addToSet": {
                    f"turns.{turn_id}.completed_by": user_id,
                },
            },
        )

    async def insert_in_timeline(
        self, game_id: ResourceId, user_id: ResourceId, track: Track, position: int
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$push": {
                    "players.$[player].timeline": {
                        "$each": [self._to_document(track, root=False)],
                        "$position": position,
                    }
                }
            },
            array_filters=[{"player.user_id": user_id}],
        )

    async def inc_tokens(
        self, game_id: ResourceId, amounts: Mapping[ResourceId, int]
    ) -> int:
        count = 0
        for user_id, amount in amounts.items():
            if amount == 0:
                continue

            count += await self._update_one(
                self._id_query(game_id),
                {"$inc": {"players.$[player].tokens": amount}},
                array_filters=[{"player.user_id": user_id}],
            )

        return count
