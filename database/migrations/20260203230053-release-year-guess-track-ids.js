const migrateReleaseYearGuessUp = (timeline, guess) => {
  // Track references cannot be backfilled accurately, so we
  // set them to null while keeping original position field
  return {
    ...guess,
    prev_track_id: null,
    next_track_id: null,
  };
};

const migrateReleaseYearGuessDown = (timeline, guess) => {
  const { prev_track_id, next_track_id, position, ...rest } = guess;
  if (position == null && (prev_track_id || next_track_id)) {
    const historicTimeline = timeline.filter(
      (t) => t.creation_time <= guess.creation_time,
    );
    if (!prev_track_id) {
      position = 0;
    } else if (!next_track_id) {
      position = historicTimeline.length - 1;
    } else {
      position = historicTimeline.findIndex(
        (t, i) =>
          t.track_id === next_track_id &&
          historicTimeline[i + -1]?.track_id === prev_track_id,
      );
    }
  }

  return {
    ...rest,
    position: position ?? -1,
  };
};

const migrateTurn = (game, turn, migrateReleaseYearGuessFn) => {
  const activePlayer = game.players.find((p) =>
    p.user_id.equals(turn.active_user_id),
  );
  const timeline = activePlayer?.timeline ?? [];

  return {
    ...turn,
    guesses: {
      ...turn.guesses,
      release_year: Object.fromEntries(
        Object.entries(turn?.guesses?.release_year ?? {}).map(
          ([userId, guess]) => [
            userId,
            migrateReleaseYearGuessFn(timeline, guess),
          ],
        ),
      ),
    },
  };
};

const migrateGames = async (db, client, migrateReleaseYearGuessFn) => {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const cursor = db.collection("game").find({});
      for await (const game of cursor) {
        const updatedTurns = game.turns.map((turn) =>
          migrateTurn(game, turn, migrateReleaseYearGuessFn),
        );

        await db
          .collection("game")
          .updateOne({ _id: game._id }, { $set: { turns: updatedTurns } });
      }
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await migrateGames(db, client, migrateReleaseYearGuessUp);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await migrateGames(db, client, migrateReleaseYearGuessDown);
  },
};
