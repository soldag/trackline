const generateJoinCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 5 },
    () => characters[Math.floor(Math.random() * characters.length)],
  ).join("");
};

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
        const cursor = db.collection("game").find({
          join_code: { $exists: false },
        });
        for await (const game of cursor) {
          const newGame = {
            ...game,
            join_code: generateJoinCode(),
          };
          await db.collection("game").replaceOne({ _id: game._id }, newGame);
        }

        await db.collection("game").createIndex(
          { join_code: 1 },
          {
            name: "join_code_index",
            unique: true,
            partialFilterExpression: { state: "waiting_for_players" },
          },
        );
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
    await db.collection("game").dropIndex("join_code_index");

    await db.collection("game").updateMany(
      {},
      {
        $unset: {
          join_code: "",
        },
      },
    );
  },
};
