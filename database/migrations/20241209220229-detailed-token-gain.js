const migrateUpScoring = (scoring, guesses) => {
  if (!scoring) {
    return null;
  }

  return {
    ...scoring,
    release_year: {
      ...scoring.release_year,
      position: migrateUpScoringAspect(
        scoring.release_year.position,
        guesses.release_year,
        false,
      ),
      year: migrateUpScoringAspect(
        scoring.release_year.year,
        guesses.release_year,
        true,
      ),
    },
    credits: migrateUpScoringAspect(scoring.credits, guesses.credits, false),
  };
};

const migrateUpScoringAspect = (scoring, guesses, ignoreCost) => {
  const { token_gain: tokenGains = {}, ...remainingFields } = scoring;
  return {
    token_gains: Object.fromEntries(
      Object.entries(tokenGains).map(([playerId, tokenGain]) => {
        if (typeof tokenGain !== "number") {
          return [playerId, tokenGain];
        }

        const tokenCost = guesses[playerId]?.token_cost ?? 0;
        const refund = ignoreCost || tokenGain < tokenCost ? 0 : tokenCost;
        const reward = tokenGain - refund;

        return [
          playerId,
          {
            refund,
            reward_theoretical: reward,
            reward_effective: reward,
          },
        ];
      }),
    ),
    ...remainingFields,
  };
};

const migrateDownScoring = (scoring) => {
  if (!scoring) {
    return null;
  }

  return {
    ...scoring,
    release_year: {
      ...scoring.release_year,
      position: migrateDownScoringAspect(scoring.release_year.position, false),
      year: migrateDownScoringAspect(scoring.release_year.year, true),
    },
    credits: migrateDownScoringAspect(scoring.credits, false),
  };
};

const migrateDownScoringAspect = (scoring, ignoreCost) => {
  const { token_gains: tokenGains = {}, ...remainingFields } = scoring;
  return {
    token_gain: Object.fromEntries(
      Object.entries(tokenGains).map(([playerId, tokenGain]) => {
        if (typeof tokenGain !== "object") {
          return [playerId, tokenGain];
        }

        const { refund, reward_effective } = tokenGain;
        const totalTokenGain = ignoreCost
          ? reward_effective
          : refund + reward_effective;

        return [playerId, totalTokenGain];
      }),
    ),
    ...remainingFields,
  };
};

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const cursor = db.collection("game").find({});
        for await (const game of cursor) {
          const newGame = {
            ...game,
            turns: game.turns.map((turn) => ({
              ...turn,
              scoring: migrateUpScoring(turn.scoring, turn.guesses),
            })),
          };
          await db.collection("game").replaceOne({ _id: game._id }, newGame);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const cursor = db.collection("game").find({});
        for await (const game of cursor) {
          const newGame = {
            ...game,
            turns: game.turns.map((turn) => ({
              ...turn,
              scoring: migrateDownScoring(turn.scoring),
            })),
          };
          await db.collection("game").replaceOne({ _id: game._id }, newGame);
        }
      });
    } finally {
      await session.endSession();
    }
  },
};
