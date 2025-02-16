module.exports = {
    async up(db, client) {
      // Rename "cartId" to "orderId" in the "cases" collection
      await db.collection("cases").updateMany(
        { cartId: { $exists: true } },
        { $rename: { cartId: "orderId" } }
      );
    },
  
    async down(db, client) {
      // Revert the rename of "orderId" back to "cartId"
      await db.collection("cases").updateMany(
        { orderId: { $exists: true } },
        { $rename: { orderId: "cartId" } }
      );
    },
  };
  