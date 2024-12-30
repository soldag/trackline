export const getRoundNumber = (game) =>
  Math.floor(Math.max(0, game.turns.length - 1) / game.players.length) + 1;

export const aggregateTokenGains = (userId, turnScoring) => {
  const {
    releaseYear: { position: positionScoring, year: yearScoring },
    credits: creditsScorings,
  } = turnScoring;
  const scorings = [positionScoring, yearScoring, creditsScorings];

  return scorings
    .map((s) => s.tokenGains[userId])
    .filter((t) => !!t)
    .reduce(
      (acc, curr) =>
        Object.assign(
          acc,
          ...Object.entries(curr).map(([key, value]) => ({
            [key]: (acc[key] ?? 0) + value,
          })),
        ),
      {
        refund: 0,
        rewardEffective: 0,
        rewardTheoretical: 0,
      },
    );
};
