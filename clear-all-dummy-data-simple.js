#!/usr/bin/env node

/**
 * Simple Clear All Dummy Data Script
 * Quick script to clear ALL data from ALL specified collections
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana';

// ALL Collections to clear
const collectionsToClear = [
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
  'usertasks'
];

async function clearAllDummyData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    
    console.log('🗑️  Clearing ALL dummy data from ALL collections...');
    console.log(`📋 Clearing ${collectionsToClear.length} collections...`);
    
    let totalDeleted = 0;
    
    for (const collectionName of collectionsToClear) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} documents from '${collectionName}'`);
        totalDeleted += result.deletedCount;
      } catch (error) {
        console.log(`❌ Error clearing '${collectionName}': ${error.message}`);
      }
    }
    
    console.log('\n🎉 All dummy data cleared successfully!');
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log('\n📝 Your database is now completely clean!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
console.log('🧹 Complete Database Cleaner');
console.log('============================');
clearAllDummyData();
