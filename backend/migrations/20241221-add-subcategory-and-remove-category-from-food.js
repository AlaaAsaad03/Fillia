export const addSubcategoryAndRemoveCategoryFromFood = {
    name: 'add-subcategory-and-remove-category-from-food',
    up: async (db) => {
      console.log('Starting migration: add-subcategory-and-remove-category-from-food');
  
      // Remove the `category` field from all documents in the `food` collection
      const unsetResult = await db.collection('food').updateMany({}, { $unset: { category: "" } });
      console.log(`Removed category field from ${unsetResult.modifiedCount} documents.`);
  
      // Add the `subcategory` field with a default value of `null` to all documents in the `food` collection
      const setResult = await db.collection('food').updateMany({}, { $set: { subcategory: null } });
      console.log(`Added subcategory field to ${setResult.modifiedCount} documents.`);
  
      console.log('Migration complete: add-subcategory-and-remove-category-from-food');
    },
  };
  