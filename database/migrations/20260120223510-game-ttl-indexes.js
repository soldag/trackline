module.exports = {
  async up(db) {
    // Drop the existing index
    await db.collection("game").dropIndex("completion_time_ttl");

    // Create a new index to expire aborted games only
    await db.collection("game").createIndex(
      { completion_time: 1 },
      {
        name: "completion_time_ttl",
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
        partialFilterExpression: { state: "aborted" },
      },
    );

    // Create a new index to expire incomplete games
    await db.collection("game").createIndex(
      { creation_time: 1 },
      {
        name: "creation_time_ttl",
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
        partialFilterExpression: { completion_time: null },
      },
    );
  },

  async down(db) {
    // Drop the creation_time_ttl index
    await db.collection("game").dropIndex("creation_time_ttl");

    // Drop the modified index
    await db.collection("game").dropIndex("completion_time_ttl");

    // Recreate the original index without the partial filter
    await db.collection("game").createIndex(
      { completion_time: 1 },
      {
        name: "completion_time_ttl",
        expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    );
  },
};
