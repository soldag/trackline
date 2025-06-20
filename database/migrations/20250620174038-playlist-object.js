module.exports = {
  async up(db) {
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
      ]
    );
  },

  async down(db) {
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
      ]
    );
  },
};
