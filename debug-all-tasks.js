const mongoose = require('mongoose');
require('dotenv').config();

async function debugAllTasks() {
    console.log('🔍 Debugging All Tasks...');
    
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana_dev';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const Task = require('./models/Task');
        const tasks = await Task.find({}).sort({ createdAt: -1 }).limit(10);
        
        console.log(`\n📊 Found ${tasks.length} tasks:`);
        tasks.forEach((task, index) => {
            console.log(`${index + 1}. ID: ${task.id || 'No ID'}`);
            console.log(`   Task: ${task.task}`);
            console.log(`   Status: ${task.status}`);
            console.log(`   Brand ID: ${task.brand_id}`);
            console.log(`   Created: ${task.createdAt}`);
            console.log('');
        });
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugAllTasks();
