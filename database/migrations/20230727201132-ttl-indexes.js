module.exports = {
  async up(db) {
    await db
      .collection("session")
      .createIndex(
        { expiration_time: 1 },
        { name: "expiration_time_ttl", expireAfterSeconds: 0 },
      );

    await db
      .collection("game")
      .createIndex(
        { completion_time: 1 },
        { name: "completion_time_ttl", expireAfterSeconds: 30 * 24 * 60 * 60 },
      );
  },

  async down(db) {
    await db.collection("session").dropIndex("expiration_time_ttl");
    await db.collection("game").dropIndex("completion_time_ttl");
  },
};
