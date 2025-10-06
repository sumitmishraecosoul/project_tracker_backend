#!/usr/bin/env node

/**
 * Simple Clear Dummy Data Script
 * Quick and simple script to clear dummy data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana_dev';

// Collections to clear
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

async function clearDummyData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    
    console.log('🗑️  Clearing dummy data...');
    
    for (const collectionName of collectionsToClear) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} documents from '${collectionName}'`);
      } catch (error) {
        console.log(`❌ Error clearing '${collectionName}': ${error.message}`);
      }
    }
    
    console.log('\n🎉 All dummy data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
clearDummyData();
