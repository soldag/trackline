module.exports = {
  async up(db) {
    await db.collection("games").updateMany(
      {
        "settings.artists_match_mode": { $exists: false },
      },
      {
        $set: {
          "settings.artists_match_mode": "one",
        },
      }
    );

    await db.collection("games").updateMany(
      {
        "settings.credits_similarity_threshold": { $exists: false },
      },
      {
        $set: {
          "settings.credits_similarity_threshold": 0.9,
        },
      }
    );
  },

  async down(db) {
    await db.collection("games").updateMany(
      {},
      {
        $unset: {
          "settings.artists_match_mode": "",
          "settings.credits_similarity_threshold": "",
        },
      }
    );
  },
};
