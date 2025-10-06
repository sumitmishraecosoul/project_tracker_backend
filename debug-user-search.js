const mongoose = require('mongoose');
const User = require('./models/User');

async function debugUserSearch() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker');
    console.log('✅ Connected to MongoDB');

    // Search for user with exact email
    console.log('🔍 Searching for user with exact email...');
    const user1 = await User.findOne({ email: 'admin@system.local' });
    console.log('Exact email search:', user1 ? 'Found' : 'Not found');

    // Search for user with case insensitive
    console.log('🔍 Searching for user with case insensitive email...');
    const user2 = await User.findOne({ email: { $regex: /^admin@system\.local$/i } });
    console.log('Case insensitive search:', user2 ? 'Found' : 'Not found');

    // Search for any user with admin role
    console.log('🔍 Searching for any admin user...');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name})`);
    });

    // Search for any user
    console.log('🔍 Searching for any user...');
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} total users:`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugUserSearch();

