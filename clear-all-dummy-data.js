#!/usr/bin/env node

/**
 * Clear All Dummy Data Script
 * This script will remove ALL data from ALL specified collections
 * 
 * WARNING: This will delete ALL data from the specified collections!
 * Make sure you have a backup before running this script.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana';

// ALL Collections to clear (in order of dependencies)
const collectionsToClear = [
  // Core system collections
  'activities',
  'brands',
  'comments',
  'notification_preferences',
  'notifications',
  'projects',
  'projectsections',
  'projectviews',
  'realtime_subscriptions',
  
  // Task-related collections
  'subtasks',
  'subtasktemplates',
  'taskdependencies',
  'taskprioritysystems',
  'tasks',
  'tasksections',
  'taskstatusworkflows',
  
  // User-related collections
  'userbrands',
  'users',
  'usertasks'
];

async function clearAllCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    
    // Get all collections in the database
    const allCollections = await db.listCollections().toArray();
    const existingCollections = allCollections.map(col => col.name);
    
    console.log('\n📋 Found collections in database:');
    existingCollections.forEach(col => console.log(`  - ${col}`));
    
    // Show what will be cleared
    console.log('\n🗑️  Collections that will be cleared:');
    const collectionsToClearFound = collectionsToClear.filter(col => 
      existingCollections.includes(col)
    );
    
    if (collectionsToClearFound.length === 0) {
      console.log('⚠️  No target collections found to clear!');
      return;
    }
    
    collectionsToClearFound.forEach(col => {
      console.log(`  - ${col}`);
    });
    
    // Show other collections that won't be cleared
    const otherCollections = existingCollections.filter(col => 
      !collectionsToClear.includes(col) && 
      !col.startsWith('system.') && 
      col !== 'sessions'
    );
    
    if (otherCollections.length > 0) {
      console.log('\n📋 Other collections (will NOT be cleared):');
      otherCollections.forEach(col => console.log(`  - ${col}`));
    }
    
    console.log('\n🚨 WARNING: This will delete ALL data from the specified collections!');
    console.log('⚠️  This action cannot be undone!');
    console.log('⚠️  Make sure you have a backup if needed!');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🚀 Starting data clearing process...');
    
    // Clear specified collections
    let totalDeleted = 0;
    for (const collectionName of collectionsToClearFound) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} documents from '${collectionName}'`);
        totalDeleted += result.deletedCount;
      } catch (error) {
        console.log(`❌ Error clearing '${collectionName}': ${error.message}`);
      }
    }
    
    // Verify collections are empty
    console.log('\n🔍 Verifying collections are empty...');
    for (const collectionName of collectionsToClearFound) {
      const count = await db.collection(collectionName).countDocuments();
      if (count === 0) {
        console.log(`✅ '${collectionName}' is now empty`);
      } else {
        console.log(`⚠️  '${collectionName}' still has ${count} documents`);
      }
    }
    
    console.log('\n🎉 All dummy data clearing completed!');
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log('\n📝 Next steps:');
    console.log('1. Run your application: npm start');
    console.log('2. Create a new admin user');
    console.log('3. Create a new brand');
    console.log('4. Start fresh with clean data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Start the process
console.log('🧹 MongoDB Complete Data Cleaner');
console.log('=================================');
console.log('This will clear ALL data from ALL specified collections');
clearAllCollections();
