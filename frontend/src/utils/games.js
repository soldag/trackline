export const getRoundNumber = (game) =>
  Math.floor(Math.max(0, game.turns.length - 1) / game.players.length) + 1;

export const getTotalTokenGain = (userId, scoring) => {
  const scorings = [
    scoring.releaseYear.position,
    scoring.releaseYear.year,
    scoring.credits,
  ];
  return scorings
    .map((s) => s.tokenGain[userId] || 0)
    .reduce((acc, curr) => acc + curr, 0);
};
