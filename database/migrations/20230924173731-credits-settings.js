module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.artists_match_mode": { $exists: false },
      },
      {
        $set: {
          "settings.artists_match_mode": "one",
        },
      },
    );

    await db.collection("game").updateMany(
      {
        "settings.credits_similarity_threshold": { $exists: false },
      },
      {
        $set: {
          "settings.credits_similarity_threshold": 0.9,
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
          "settings.artists_match_mode": "",
          "settings.credits_similarity_threshold": "",
        },
      },
    );
  },
};
