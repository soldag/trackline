module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.enable_catchup": { $exists: false },
      },
      {
        $set: {
          "settings.enable_catchup": false,
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
    await db.collection("game").updateMany(
      {},
      {
        $unset: {
          "settings.enable_catchup": "",
        },
      },
    );
  },
};
