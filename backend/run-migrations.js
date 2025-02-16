import { MongoClient } from 'mongodb';
import { addSubcategoryAndRemoveCategoryFromFood } from './migrations/20241221-add-subcategory-and-remove-category-from-food.js';

// Array of migration modules
const migrations = [
  {
    name: 'add-image-field-to-users',
    up: async (db) => {
      await db.collection('users').updateMany({}, { $set: { image: null } });
    },
  },
  {
    name: 'rename-cartId-to-orderId-in-cases',
    up: async (db) => {
      await db.collection('cases').updateMany(
        { cartId: { $exists: true } },
        { $rename: { cartId: 'orderId' } }
      );
    },
  },
  addSubcategoryAndRemoveCategoryFromFood,
];

async function runMigrations() {
  const uri = 'mongodb+srv://zahraaibrahim666:KUYyYtxFIwPrQGjz@cluster0.d76sz.mongodb.net';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('food-del');

    // Ensure the `migrations` collection exists
    const migrationsCollection = db.collection('migrations');

    // Fetch already applied migrations
    const appliedMigrations = await migrationsCollection.find().toArray();
    const appliedMigrationNames = appliedMigrations.map((m) => m.name);

    // Loop through migrations and apply only those not already applied
    for (const migration of migrations) {
      if (!appliedMigrationNames.includes(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        await migration.up(db); // Apply migration
        await migrationsCollection.insertOne({
          name: migration.name,
          appliedAt: new Date(),
        });
        console.log(`Migration applied: ${migration.name}`);
      } else {
        console.log(`Skipping already applied migration: ${migration.name}`);
      }
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

runMigrations();
