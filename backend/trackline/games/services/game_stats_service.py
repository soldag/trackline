import itertools
import logging
from collections import defaultdict
from collections.abc import Collection, Iterable, Sequence
from datetime import datetime, timedelta
from typing import overload

from trackline.core.fields import ResourceId
from trackline.games.models import Game, ReleaseYearGuess, TimelineTrack, Turn
from trackline.games.schemas import (
    CreditsStatsOut,
    GuessStatsOut,
    ReleaseYearStatsOut,
    UserStatsOut,
)

log = logging.getLogger(__name__)


@overload
def get_mean(values: Sequence[float]) -> float | None: ...


@overload
def get_mean(values: Sequence[timedelta]) -> timedelta | None: ...


def get_mean(
    values: Sequence[float | timedelta | None],
) -> float | timedelta | None:
    values = [x for x in values if x is not None]
    if not values:
        return None

    return sum(values[1:], start=values[0]) / len(values)


def get_accuracy(num_correct: int, num_total: int) -> float | None:
    if num_total == 0:
        return None

    return num_correct / num_total


class ReleaseYearStatsBuilder:
    def __init__(self) -> None:
        self._times_to_guess: list[timedelta] = []
        self._guess_count: int = 0
        self._correct_position_guess_count: int = 0
        self._correct_year_guess_count: int = 0
        self._position_deviations: list[float] = []
        self._year_deviations: list[int] = []

    def add(self, game: Game, turn: Turn, user_id: ResourceId) -> None:
        guess = turn.guesses.release_year.get(user_id)
        if not guess or not turn.scoring:
            return

        self._guess_count += 1
        if user_id in turn.scoring.release_year.position.correct_guesses:
            self._correct_position_guess_count += 1
        if user_id in turn.scoring.release_year.year.correct_guesses:
            self._correct_year_guess_count += 1

        timeline = self._get_timeline_at_turn(game, turn)
        min_correct_position, max_correct_position = self._get_correct_position_range(
            timeline, turn.track.release_year
        )

        try:
            position = self._get_position(timeline, guess)
        except ValueError:
            log.warning(
                "Unable to determine track position "
                "(game_id: %s, turn_index: %s, user_id: %s)",
                game.id,
                game.turns.index(turn),
                user_id,
            )
            return

        position_deviation = max(
            min_correct_position - position,
            position - max_correct_position,
            0,
        )
        self._position_deviations.append(position_deviation)

        self._times_to_guess.append(guess.creation_time - turn.creation_time)
        self._year_deviations.append(abs(turn.track.release_year - guess.year))

    def build(self) -> ReleaseYearStatsOut:
        return ReleaseYearStatsOut(
            guess_count=self._guess_count,
            mean_time_to_guess=get_mean(self._times_to_guess),
            position_mean_accuracy=get_accuracy(
                self._correct_position_guess_count, self._guess_count
            ),
            position_mean_absolute_error=get_mean(self._position_deviations),
            year_mean_accuracy=get_accuracy(
                self._correct_year_guess_count, self._guess_count
            ),
            year_mean_absolute_error=get_mean(self._year_deviations),
        )

    def _get_timeline_at_turn(self, game: Game, turn: Turn) -> list[TimelineTrack]:
        player = game.get_player(turn.active_user_id)
        return [t for t in player.timeline if t.creation_time <= turn.creation_time]

    def _get_position(
        self, timeline: list[TimelineTrack], guess: ReleaseYearGuess
    ) -> int:
        spotify_id_to_idx = {track.spotify_id: i for i, track in enumerate(timeline)}

        if guess.prev_track_id:
            return spotify_id_to_idx[guess.prev_track_id] + 1
        if guess.next_track_id:
            return spotify_id_to_idx[guess.next_track_id]

        raise ValueError("Cannot determine position from guess")

    def _get_correct_position_range(
        self, timeline: list[TimelineTrack], release_year: int
    ) -> tuple[int, int]:
        min_position = next(
            (
                i
                for i in range(len(timeline))
                if timeline[i].release_year >= release_year
            ),
            len(timeline),
        )

        max_position = next(
            (
                i + 1
                for i in range(len(timeline) - 1, -1, -1)
                if timeline[i].release_year <= release_year
            ),
            0,
        )

        return min_position, max_position


class CreditsStatsBuilder:
    def __init__(self) -> None:
        self._times_to_guess: list[timedelta] = []
        self._guess_count: int = 0
        self._correct_guess_count: int = 0
        self._similarity_scores: list[float] = []

    def add(self, turn: Turn, user_id: ResourceId) -> None:
        guess = turn.guesses.credits.get(user_id)
        if not guess or not turn.scoring:
            return

        self._guess_count += 1
        if user_id in turn.scoring.credits.correct_guesses:
            self._correct_guess_count += 1

        self._times_to_guess.append(guess.creation_time - turn.creation_time)

        similarity_score = turn.scoring.credits.similarity_scores.get(user_id)
        if similarity_score is not None:
            self._similarity_scores.append(similarity_score)

    def build(self) -> CreditsStatsOut:
        return CreditsStatsOut(
            guess_count=self._guess_count,
            mean_time_to_guess=get_mean(self._times_to_guess),
            mean_accuracy=get_accuracy(self._correct_guess_count, self._guess_count),
            mean_similarity=get_mean(self._similarity_scores),
        )


class GameStatsService:
    MAX_IDLE_DURATION = timedelta(minutes=10)

    def get_user_stats(
        self, games: Collection[Game], user_id: ResourceId
    ) -> UserStatsOut:
        durations = [self._get_duration(g) for g in games]
        guess_stats, guess_stats_by_year = self._get_guess_stats(games, user_id)

        return UserStatsOut(
            total_games=len(games),
            won_games=self._get_won_games(user_id, games),
            total_duration=sum(durations, timedelta(0)),
            mean_duration=get_mean(durations),
            total_played_tracks=self._get_total_played_tracks(games),
            total_timeline_tracks=self._get_total_timeline_tracks(user_id, games),
            guess_stats=guess_stats,
            guess_stats_by_year=guess_stats_by_year,
        )

    def _get_won_games(self, user_id: ResourceId, games: Iterable[Game]) -> int:
        count = 0
        for game in games:
            winner = max(game.players, key=lambda p: len(p.timeline))
            if winner.user_id == user_id:
                count += 1

        return count

    def _get_total_played_tracks(self, games: Iterable[Game]) -> int:
        return len({t.track.spotify_id for g in games for t in g.turns})

    def _get_total_timeline_tracks(
        self, user_id: ResourceId, games: Iterable[Game]
    ) -> int:
        return sum(len(g.get_player(user_id).timeline) for g in games)

    def _get_duration(self, game: Game) -> timedelta:
        activity_stream: list[datetime] = [game.creation_time]

        if game.completion_time:
            activity_stream.append(game.completion_time)

        for turn in game.turns:
            activity_stream.append(turn.creation_time)

            activity_stream.extend(
                guess.creation_time
                for guesses in (turn.guesses.credits, turn.guesses.release_year)
                for guess in guesses.values()
            )

            activity_stream.extend(
                turn_pass.creation_time for turn_pass in turn.passes.values()
            )

        duration = timedelta(0)
        for curr_ts, next_ts in itertools.pairwise(sorted(activity_stream)):
            delta = next_ts - curr_ts
            if delta < self.MAX_IDLE_DURATION:
                duration += delta

        return duration

    def _get_guess_stats(
        self, games: Iterable[Game], user_id: ResourceId
    ) -> tuple[GuessStatsOut, dict[int, GuessStatsOut]]:
        release_year_stats = ReleaseYearStatsBuilder()
        release_year_stats_by_year: dict[int, ReleaseYearStatsBuilder] = defaultdict(
            ReleaseYearStatsBuilder
        )
        credits_stats = CreditsStatsBuilder()
        credits_stats_by_year: dict[int, CreditsStatsBuilder] = defaultdict(
            CreditsStatsBuilder
        )

        for game in games:
            for turn in game.turns:
                release_year = turn.track.release_year

                release_year_stats.add(game, turn, user_id)
                release_year_stats_by_year[release_year].add(game, turn, user_id)

                credits_stats.add(turn, user_id)
                credits_stats_by_year[release_year].add(turn, user_id)

        guess_stats = self._build_guess_stats(release_year_stats, credits_stats)
        guess_stats_by_year = {
            release_year: GuessStatsOut(
                release_year=release_year_stats_by_year[release_year].build(),
                credits=credits_stats_by_year[release_year].build(),
            )
            for release_year in {
                *release_year_stats_by_year,
                *credits_stats_by_year,
            }
        }

        return guess_stats, guess_stats_by_year

    def _build_guess_stats(
        self,
        release_year_stats: ReleaseYearStatsBuilder,
        credits_stats: CreditsStatsBuilder,
    ) -> GuessStatsOut:
        return GuessStatsOut(
            release_year=release_year_stats.build(),
            credits=credits_stats.build(),
        )
