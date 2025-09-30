#!/usr/bin/env node

/**
 * Clear Dummy Data Script
 * This script will remove all dummy data from MongoDB collections
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

// Collections to clear (in order of dependencies)
const collectionsToClear = [
  'subtasks',
  'subtasktemplates', 
  'taskdependencies',
  'taskprioritysystems',
  'tasks',
  'tasksections',
  'taskstatusworkflows',
  'userbrands',
  'usertasks',
  'users'
];

// Additional collections that might exist
const additionalCollections = [
  'projects',
  'brands',
  'comments',
  'activities',
  'notifications',
  'notificationpreferences',
  'realtimesubscriptions',
  'projectviews',
  'projectsections'
];

async function clearCollections() {
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
    
    // Clear specified collections
    console.log('\n🗑️  Clearing dummy data from specified collections...');
    
    for (const collectionName of collectionsToClear) {
      if (existingCollections.includes(collectionName)) {
        try {
          const result = await db.collection(collectionName).deleteMany({});
          console.log(`✅ Cleared ${result.deletedCount} documents from '${collectionName}'`);
        } catch (error) {
          console.log(`❌ Error clearing '${collectionName}': ${error.message}`);
        }
      } else {
        console.log(`⚠️  Collection '${collectionName}' not found`);
      }
    }
    
    // Ask about additional collections
    console.log('\n🔍 Additional collections found:');
    const otherCollections = existingCollections.filter(col => 
      !collectionsToClear.includes(col) && 
      !col.startsWith('system.') && 
      col !== 'sessions'
    );
    
    if (otherCollections.length > 0) {
      console.log('Other collections in database:');
      otherCollections.forEach(col => console.log(`  - ${col}`));
      console.log('\n⚠️  These collections were NOT cleared. If you want to clear them, add them to the collectionsToClear array.');
    }
    
    // Verify collections are empty
    console.log('\n🔍 Verifying collections are empty...');
    for (const collectionName of collectionsToClear) {
      if (existingCollections.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments();
        if (count === 0) {
          console.log(`✅ '${collectionName}' is now empty`);
        } else {
          console.log(`⚠️  '${collectionName}' still has ${count} documents`);
        }
      }
    }
    
    console.log('\n🎉 Dummy data clearing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run your application');
    console.log('2. Create new admin user');
    console.log('3. Create new brand');
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

// Safety confirmation
console.log('🚨 WARNING: This script will delete ALL data from the following collections:');
collectionsToClear.forEach(col => console.log(`  - ${col}`));
console.log('\n⚠️  This action cannot be undone!');
console.log('⚠️  Make sure you have a backup if needed!');
console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');

// Wait 5 seconds before proceeding
setTimeout(() => {
  console.log('\n🚀 Starting data clearing process...');
  clearCollections();
}, 5000);
