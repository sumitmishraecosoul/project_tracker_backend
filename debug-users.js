const mongoose = require('mongoose');
const User = require('./models/User');

async function debugUsers() {
  try {
    console.log('🔍 Debugging users...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash: ${user.password ? 'EXISTS' : 'MISSING'}`);
      console.log(`   Security hash: ${user.security?.password_hash ? 'EXISTS' : 'MISSING'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugUsers();

