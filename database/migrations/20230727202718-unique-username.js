module.exports = {
  async up(db) {
    await db
      .collection("user")
      .createIndex({ username: 1 }, { name: "username_unique", unique: true });
  },

  async down(db) {
    await db.collection("user").dropIndex("username_unique");
  },
};
