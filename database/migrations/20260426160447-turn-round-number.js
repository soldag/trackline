module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const cursor = db.collection("game").find({});
        for await (const game of cursor) {
          let roundNumber = 1;
          const seenUserIds = new Set();
          const newGame = {
            ...game,
            turns: game.turns.map((turn) => {
              const activeUserId = turn.active_user_id.toString();
              if (seenUserIds.has(activeUserId)) {
                roundNumber++;
                seenUserIds.clear();
              }
              seenUserIds.add(activeUserId);
              return { ...turn, round_number: roundNumber };
            }),
          };
          await db.collection("game").replaceOne({ _id: game._id }, newGame);
        }
      });
    } finally {
      await session.endSession();
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db
      .collection("game")
      .updateMany({}, { $unset: { "turns.$[].round_number": "" } });
  },
};
