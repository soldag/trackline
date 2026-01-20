module.exports = {
  async up(db) {
    await db.collection("session").updateMany(
      {},
      {
        $rename: {
          creation_date: "creation_time",
          expiration_date: "expiration_time",
        },
      },
    );
  },

  async down(db, client) {
    await db.collection("session").updateMany(
      {},
      {
        $rename: {
          creation_time: "creation_date",
          expiration_time: "expiration_date",
        },
      },
    );
  },
};
