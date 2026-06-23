module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.credits_convert_numbers": { $exists: false },
      },
      {
        $set: {
          "settings.credits_convert_numbers": false,
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
          "settings.credits_convert_numbers": "",
        },
      },
    );
  },
};
