module.exports = {
  async up(db) {
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

  async down(db) {
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
