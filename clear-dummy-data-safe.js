#!/usr/bin/env node

/**
 * Safe Clear Dummy Data Script
 * This script provides a safer way to clear dummy data with confirmation prompts
 */

const mongoose = require('mongoose');
const readline = require('readline');
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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function clearCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    
    // Get all collections in the database
    const allCollections = await db.listCollections().toArray();
    const existingCollections = allCollections.map(col => col.name);
    
    console.log('\n📋 Collections found in database:');
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
    
    // Final confirmation
    console.log('\n🚨 WARNING: This will delete ALL data from the specified collections!');
    const confirm1 = await askQuestion('Are you sure you want to continue? (yes/no): ');
    
    if (confirm1.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled by user');
      return;
    }
    
    const confirm2 = await askQuestion('Type "DELETE" to confirm: ');
    
    if (confirm2 !== 'DELETE') {
      console.log('❌ Operation cancelled - confirmation text did not match');
      return;
    }
    
    console.log('\n🚀 Starting data clearing process...');
    
    // Clear specified collections
    for (const collectionName of collectionsToClearFound) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} documents from '${collectionName}'`);
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
    
    console.log('\n🎉 Dummy data clearing completed successfully!');
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
    rl.close();
    process.exit(0);
  }
}

// Start the process
console.log('🧹 MongoDB Dummy Data Cleaner');
console.log('============================');
clearCollections();
