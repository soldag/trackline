module.exports = {
  async up(db) {
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

  async down(db) {
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
