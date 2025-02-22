import { Game, TurnScoring } from "@/types/games";

export const getRoundNumber = (game: Game) =>
  Math.floor(Math.max(0, game.turns.length - 1) / game.players.length) + 1;

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
