const mongoose = require('mongoose');
const User = require('./models/User');

async function testServerDBConnection() {
  try {
    console.log('🔌 Testing server database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker');
    console.log('✅ Connected to MongoDB');

    // Test the exact same query that the login endpoint uses
    console.log('🔍 Testing exact login query...');
    const user = await User.findOne({ email: 'admin@system.local' });
    
    if (user) {
      console.log('✅ User found in database');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password hash exists: ${!!user.password}`);
    } else {
      console.log('❌ User not found in database');
    }

    // Test password comparison
    if (user) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log(`Password match: ${isMatch}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testServerDBConnection();

