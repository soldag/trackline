const getMinTimestamp = (value1, value2) => {
  if (!value1) return value2;
  if (!value2) return value1;

  return Date.parse(value1) < Date.parse(value2) ? value1 : value2;
};

const migrateUpGuess = (guess) => ({
  creation_time: guess.creation_time,
  position: guess.position,
  year: guess.release_year || -1,
  token_cost: 0,
});

const migrateUpPasses = (guesses) =>
  Object.fromEntries(
    Object.entries(guesses).map(([userId, guess]) => [
      userId,
      { creation_time: guess.creation_time },
    ]),
  );

const migrateUpScoring = (scoring) => {
  if (!scoring) {
    return null;
  }

  return {
    release_year: {
      position: {
        winner: scoring.position.winner,
        correct_guesses: scoring.position.winner
          ? [scoring.position.winner]
          : [],
        token_gain: scoring.position.tokens_delta,
      },
      year: {
        winner: scoring.release_year.winner,
        correct_guesses: scoring.release_year.winner
          ? [scoring.release_year.winner]
          : [],
        token_gain: scoring.release_year.tokens_delta,
      },
    },
    credits: {
      winner: null,
      correct_guesses: [],
      token_gain: {},
      similarity_scores: {},
    },
  };
};

const migrateDownGuesses = (guesses, passes) => {
  const newGuesses = Object.fromEntries(
    Object.entries(passes).map(([userId, pass]) => [
      userId,
      {
        creation_time: pass.creation_time,
        position: null,
        release_year: null,
      },
    ]),
  );

  for (const [userId, guess] of Object.entries(guesses.release_year)) {
    newGuesses[userId] = {
      creation_time: getMinTimestamp(
        newGuesses[userId]?.creation_time,
        guess.creation_time,
      ),
      position: guess.position,
      release_year: guess.year > 0 ? guess.year : null,
    };
  }

  return newGuesses;
};

const migrateDownScoring = (guesses, scoring) => {
  if (!scoring) {
    return null;
  }

  return {
    position: {
      winner: scoring.release_year.position.winner,
      tokens_delta: Object.fromEntries(
        Object.entries(scoring.release_year.position.token_gain).map(
          ([userId, tokenGain]) => [
            userId,
            tokenGain - (guesses.release_year[userId]?.tokenCost || 0),
          ],
        ),
      ),
    },
    release_year: {
      winner: scoring.release_year.position.winner,
      tokens_delta: scoring.release_year.position.token_gain,
    },
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
              guesses: {
                release_year: Object.fromEntries(
                  Object.entries(turn.guesses)
                    .filter(([, guess]) => guess.position != null)
                    .map(([userId, guess]) => [userId, migrateUpGuess(guess)]),
                ),
                credits: {},
              },
              passes: migrateUpPasses(turn.guesses),
              scoring: migrateUpScoring(turn.scoring),
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
              guesses: migrateDownGuesses(turn.guesses, turn.passes),
              scoring: migrateDownScoring(turn.guesses, turn.scoring),
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
