const mongoose = require('mongoose');

async function checkServerDB() {
  try {
    console.log('🔍 Checking server database connection...');
    
    // Use the same connection logic as server.js
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('📊 Database URI:', mongoUri ? 'Set via environment' : 'Using default');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Check if we can find the admin user
    const User = require('./models/User');
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    
    if (adminUser) {
      console.log('✅ Admin user found in server database');
      console.log('   Name:', adminUser.name);
      console.log('   Email:', adminUser.email);
    } else {
      console.log('❌ Admin user not found in server database');
      
      // List all users
      const allUsers = await User.find({});
      console.log('📊 All users in server database:');
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkServerDB();
