const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ Error: MONGODB_URI or MONGO_URI environment variable is not set');
  process.exit(1);
}

// List all collections to be cleared
const COLLECTIONS = [
  'activities',
  'brands',
  'comments',
  'notification_preferences',
  'notifications',
  'projects',
  'projectsections',
  'projectviews',
  'realtime_subscriptions',
  'subtasks',
  'subtasktemplates',
  'taskdependencies',
  'taskprioritysystems',
  'tasks',
  'tasksections',
  'taskstatusworkflows',
  'userbrands',
  'users',
  'usertasks',
  'categories' // New category collection
];

async function deleteAllData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    console.log('═'.repeat(70));
    console.log('    ⚠️  COMPLETE DATABASE CLEANUP - DELETE ALL DATA  ⚠️');
    console.log('═'.repeat(70));
    console.log('\n🚨 WARNING: This will permanently delete ALL data from ALL collections!');
    console.log('🚨 This includes:');
    console.log('   - All users (including admins)');
    console.log('   - All brands');
    console.log('   - All projects');
    console.log('   - All tasks and subtasks');
    console.log('   - All comments and activities');
    console.log('   - All notifications');
    console.log('   - ALL other data\n');
    console.log('⏱️  Starting in 10 seconds... Press Ctrl+C to cancel.\n');

    // Wait 10 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('🔍 Scanning database...\n');

    const db = mongoose.connection.db;
    const collectionsInDb = await db.listCollections().toArray();
    const collectionNames = collectionsInDb.map(col => col.name);

    console.log(`📊 Found ${collectionNames.length} collections in database:\n`);

    // Get counts before deletion
    const countsBeforeDeletion = {};
    for (const collectionName of collectionNames) {
      try {
        const count = await db.collection(collectionName).countDocuments({});
        countsBeforeDeletion[collectionName] = count;
        console.log(`   ${collectionName.padEnd(30)} : ${count.toString().padStart(6)} documents`);
      } catch (error) {
        console.log(`   ${collectionName.padEnd(30)} : Error getting count`);
      }
    }

    const totalDocuments = Object.values(countsBeforeDeletion).reduce((sum, count) => sum + count, 0);
    console.log(`\n   ${'TOTAL'.padEnd(30)} : ${totalDocuments.toString().padStart(6)} documents\n`);

    if (totalDocuments === 0) {
      console.log('✅ Database is already empty. Nothing to delete.\n');
      await mongoose.connection.close();
      console.log('✅ Cleanup completed!');
      process.exit(0);
    }

    console.log('═'.repeat(70));
    console.log('🗑️  Starting deletion process...\n');

    const deletionResults = {};
    let totalDeleted = 0;

    for (const collectionName of collectionNames) {
      try {
        console.log(`   Deleting from ${collectionName}...`);
        const result = await db.collection(collectionName).deleteMany({});
        deletionResults[collectionName] = result.deletedCount;
        totalDeleted += result.deletedCount;
        console.log(`   ✅ Deleted ${result.deletedCount} documents from ${collectionName}\n`);
      } catch (error) {
        console.log(`   ❌ Error deleting from ${collectionName}: ${error.message}\n`);
        deletionResults[collectionName] = 0;
      }
    }

    // Verify deletion
    console.log('═'.repeat(70));
    console.log('🔍 Verifying deletion...\n');

    let remainingDocuments = 0;
    for (const collectionName of collectionNames) {
      try {
        const count = await db.collection(collectionName).countDocuments({});
        remainingDocuments += count;
        if (count > 0) {
          console.log(`   ⚠️  ${collectionName} still has ${count} documents`);
        } else {
          console.log(`   ✅ ${collectionName} is empty`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error verifying ${collectionName}`);
      }
    }

    console.log('\n═'.repeat(70));
    if (remainingDocuments === 0) {
      console.log('✅ DATABASE CLEANUP COMPLETED SUCCESSFULLY!');
    } else {
      console.log('⚠️  CLEANUP COMPLETED WITH WARNINGS');
      console.log(`   ${remainingDocuments} documents may still remain`);
    }
    console.log('═'.repeat(70));

    console.log('\n📋 Deletion Summary:');
    console.log(`   Total documents before: ${totalDocuments}`);
    console.log(`   Total documents deleted: ${totalDeleted}`);
    console.log(`   Remaining documents: ${remainingDocuments}\n`);

    console.log('📊 Detailed Results:\n');
    for (const [collection, count] of Object.entries(deletionResults)) {
      if (count > 0) {
        console.log(`   ${collection.padEnd(30)} : ${count.toString().padStart(6)} deleted`);
      }
    }

    if (remainingDocuments === 0) {
      console.log('\n✨ The database is now completely clean!');
      console.log('   You can now start fresh with the new Category system.\n');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Cleanup Error:', error);
    console.error('\nStack trace:', error.stack);
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Cleanup cancelled by user.');
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error closing connection:', error);
  }
  process.exit(0);
});

process.on('unhandledRejection', async (error) => {
  console.error('\n❌ Unhandled Promise Rejection:', error);
  try {
    await mongoose.connection.close();
  } catch (closeError) {
    console.error('Error closing connection:', closeError);
  }
  process.exit(1);
});

// Run cleanup
console.log('\n🚀 Starting complete database cleanup...\n');
deleteAllData();


