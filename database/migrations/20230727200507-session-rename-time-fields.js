module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("session").updateMany(
      {},
      {
        $rename: {
          creation_date: "creation_time",
          expiration_date: "expiration_time",
        },
      },
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("session").updateMany(
      {},
      {
        $rename: {
          creation_time: "creation_date",
          expiration_time: "expiration_date",
        },
      },
    );
  },
};
