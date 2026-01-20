const { v4: uuid } = require("uuid");

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
              revision_id: uuid(),
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
            turns: game.turns.map(({ revision_id, ...turn }) => turn),
          };
          await db.collection("game").replaceOne({ _id: game._id }, newGame);
        }
      });
    } finally {
      await session.endSession();
    }
  },
};
