const mongoose = require('mongoose');
require('dotenv').config();

async function debugUserDetails() {
    console.log('🔍 Debugging User Details...');
    
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const User = require('./models/User');
        const users = await User.find({});
        
        console.log(`\n📊 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Employee Number: ${user.employeeNumber}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log(`   Password Hash: ${user.password ? 'Set' : 'Not Set'}`);
            console.log('');
        });
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugUserDetails();
