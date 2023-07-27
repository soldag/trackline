module.exports = {
  async up(db) {
    await db
      .collection("sessions")
      .createIndex(
        { expiration_time: 1 },
        { name: "expiration_time_ttl", expireAfterSeconds: 0 }
      );

    await db
      .collection("games")
      .createIndex(
        { completion_time: 1 },
        { name: "completion_time_ttl", expireAfterSeconds: 30 * 24 * 60 * 60 }
      );
  },

  async down(db) {
    await db.collection("sessions").dropIndex("expiration_time_ttl");
    await db.collection("games").dropIndex("completion_time_ttl");
  },
};
