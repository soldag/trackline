module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.credits_filter_stop_words": { $exists: false },
      },
      {
        $set: {
          "settings.credits_filter_stop_words": false,
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
          "settings.credits_filter_stop_words": "",
        },
      },
    );
  },
};
