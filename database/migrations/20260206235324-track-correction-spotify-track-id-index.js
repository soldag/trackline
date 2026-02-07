module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db
      .collection("track_correction")
      .createIndex(
        { track_spotify_id: 1 },
        { name: "track_spotify_id_index", unique: true },
      );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("track_correction").dropIndex("track_spotify_id_index");
  },
};
