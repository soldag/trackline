module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.playlist_ids": { $exists: true, $type: "array" },
      },
      [
        {
          $set: {
            "settings.playlists": {
              $map: {
                input: "$settings.playlist_ids",
                as: "spotify_id",
                in: { spotify_id: "$$spotify_id", track_count: -1 },
              },
            },
          },
        },
        { $unset: "settings.playlist_ids" },
      ],
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    await db.collection("game").updateMany(
      {
        "settings.playlists": { $exists: true, $type: "array" },
      },
      [
        {
          $set: {
            "settings.playlist_ids": {
              $map: {
                input: "$settings.playlists",
                as: "playlist",
                in: "$$playlist.spotify_id",
              },
            },
          },
        },
        { $unset: "settings.playlists" },
      ],
    );
  },
};
