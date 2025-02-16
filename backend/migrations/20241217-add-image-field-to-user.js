module.exports = {
    async up(db, client) {
      // Add the "image" field to the "users" collection
      await db.collection('users').updateMany({}, { $set: { image: null } });
    },
  
    async down(db, client) {
      // Remove the "image" field from the "users" collection
      await db.collection('users').updateMany({}, { $unset: { image: "" } });
    },
  };
  