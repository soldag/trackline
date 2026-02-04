import { Game, ReleaseYearGuess, Track, TurnScoring } from "@/types/games";

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
