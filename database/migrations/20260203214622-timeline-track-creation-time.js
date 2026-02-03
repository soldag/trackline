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
          const trackTimestamps = new Map();
          game.turns.forEach((turn, index) => {
            const nextTurn = game.turns[index + 1];
            if (nextTurn) {
              trackTimestamps.set(
                turn.track.spotify_id,
                nextTurn.creation_time,
              );
            } else if (game.completion_time) {
              trackTimestamps.set(turn.track.spotify_id, game.completion_time);
            } else {
              trackTimestamps.set(turn.track.spotify_id, turn.creation_time);
            }
          });

          const newGame = {
            ...game,
            players: game.players.map((player) => ({
              ...player,
              timeline: player.timeline.map((track) => ({
                ...track,
                creation_time:
                  trackTimestamps.get(track.spotify_id) ?? game.creation_time,
              })),
            })),
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
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const cursor = db.collection("game").find({});
        for await (const game of cursor) {
          const newGame = {
            ...game,
            players: game.players.map((player) => ({
              ...player,
              timeline: player.timeline.map((track) => {
                const { creation_time, ...rest } = track;
                return rest;
              }),
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
