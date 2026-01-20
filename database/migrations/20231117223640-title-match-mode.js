module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.title_match_mode": { $exists: false },
      },
      {
        $set: {
          "settings.title_match_mode": "full",
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
          "settings.title_match_mode": "",
        },
      },
    );
  },
};
