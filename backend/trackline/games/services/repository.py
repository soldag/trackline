from collections.abc import Mapping

from pymongo import UpdateOne

from trackline.core.db.repository import Repository
from trackline.core.fields import ResourceId
from trackline.games.models import (
    CreditsGuess,
    Game,
    Guess,
    Player,
    ReleaseYearGuess,
    Track,
    Turn,
    TurnPass,
    TurnScoring,
)


class GameRepository(Repository[Game]):
    class Meta:
        collection_name = "games"

    async def add_player(
        self, game_id: ResourceId, player: Player, position: int | None = None
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$push": {
                    "players": {
                        "$each": [self._to_document(player, root=False)],
                        "$position": position,
                    }
                }
            },
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
                    f"turns.{turn_id}.guesses.releaseYear": {},
                    f"turns.{turn_id}.guesses.credits": {},
                    f"turns.{turn_id}.passes": {},
                },
                "$push": {
                    "discarded_track_ids": old_track_id,
                },
            },
        )

    async def add_guess(
        self, game_id: ResourceId, turn_id: int, user_id: ResourceId, guess: Guess
    ) -> int:
        match guess:
            case ReleaseYearGuess():
                guess_type = "release_year"
            case CreditsGuess():
                guess_type = "credits"
            case _:
                raise ValueError("Invalid guess type")

        return await self._update_one(
            self._id_query(game_id),
            {
                "$set": {
                    f"turns.{turn_id}.guesses.{guess_type}.{user_id}": self._to_document(
                        guess,
                        root=False,
                    )
                }
            },
        )

    async def add_turn_pass(
        self,
        game_id: ResourceId,
        turn_id: int,
        user_id: ResourceId,
        turn_pass: TurnPass,
    ) -> int:
        return await self._update_one(
            self._id_query(game_id),
            {
                "$set": {
                    f"turns.{turn_id}.passes.{user_id}": self._to_document(
                        turn_pass,
                        root=False,
                    ),
                }
            },
        )

    async def validate_credits_guess(
        self,
        game_id: ResourceId,
        turn_id: int,
        user_id: ResourceId,
        is_correct: bool,
    ) -> int:
        guess_path = f"turns.{turn_id}.guesses.credits.{user_id}"
        return await self._update_one(
            self._id_query(game_id),
            {
                "$set": {
                    f"{guess_path}.is_validated": True,
                    f"{guess_path}.is_correct": is_correct,
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
        return await self._update_bulk(
            [
                UpdateOne(
                    self._id_query(game_id),
                    {"$inc": {"players.$[player].tokens": amount}},
                    array_filters=[{"player.user_id": user_id}],
                )
                for user_id, amount in amounts.items()
                if amount != 0
            ]
        )
