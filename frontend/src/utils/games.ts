import { TOKEN_COST_BUY_TRACK } from "@/constants";
import {
  Game,
  Player,
  ReleaseYearGuess,
  Track,
  TurnScoring,
} from "@/types/games";

export const getRoundNumber = (game: Game) =>
  Math.floor(Math.max(0, game.turns.length - 1) / game.players.length) + 1;

export const getTrackPosition = (timeline: Track[], track: Track) => {
  const position = timeline.findIndex((t) => t.releaseYear > track.releaseYear);
  return position < 0 ? timeline.length : position;
};

export const getTrackPositionFromGuess = (
  timeline: Track[],
  guess: ReleaseYearGuess,
) => {
  if (guess.prevTrackId === null) {
    return 0;
  }

  if (guess.nextTrackId === null) {
    return timeline.length;
  }

  const prevIndex = timeline.findIndex(
    (t) => t.spotifyId === guess.prevTrackId,
  );
  if (prevIndex < 0 || prevIndex === timeline.length - 1) {
    throw new Error("Invalid guess track position");
  }

  return prevIndex + 1;
};

export const aggregateTokenGains = (
  userId: string,
  turnScoring: TurnScoring,
) => {
  const {
    releaseYear: { position: positionScoring, year: yearScoring },
    credits: creditsScorings,
  } = turnScoring;
  const scorings = [positionScoring, yearScoring, creditsScorings];

  return scorings
    .map((s) => s.tokenGains[userId])
    .filter((t) => !!t)
    .reduce(
      (acc, curr) => ({
        refund: acc.refund + curr.refund,
        rewardTheoretical: acc.rewardTheoretical + curr.rewardTheoretical,
        rewardEffective: acc.rewardEffective + curr.rewardEffective,
      }),
      {
        refund: 0,
        rewardEffective: 0,
        rewardTheoretical: 0,
      },
    );
};

export const checkEndCondition = (
  game: Game,
): { isGameEnding: boolean; winner?: Player } => {
  if (game.turns.length === 0) {
    return { isGameEnding: false };
  }

  const activeUserId = game.turns[game.turns.length - 1].activeUserId;
  const roundComplete =
    game.players[game.players.length - 1].userId === activeUserId;

  const timelineLengths = game.players.map((p) => p.timeline.length);
  const maxTimelineLength = Math.max(...timelineLengths);
  const leadingPlayers = game.players.filter(
    (p) => p.timeline.length === maxTimelineLength,
  );
  const isGameEnding =
    roundComplete &&
    leadingPlayers.length === 1 &&
    maxTimelineLength >= game.settings.timelineLength;

  return {
    isGameEnding,
    winner: isGameEnding ? leadingPlayers[0] : undefined,
  };
};

export const checkCatchUp = (game: Game, player: Player): boolean => {
  const maxTimelineLength = Math.max(
    ...game.players.map((p) => p.timeline.length),
  );
  if (player.timeline.length === maxTimelineLength) {
    return false;
  }

  const affordableTrackCount = Math.floor(player.tokens / TOKEN_COST_BUY_TRACK);
  return player.timeline.length + affordableTrackCount >= maxTimelineLength;
};
