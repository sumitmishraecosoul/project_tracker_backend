const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testLoginDirect() {
  try {
    console.log('🧪 Testing Login Directly...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find user
    const user = await User.findOne({ email: 'admin@system.local' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.name);
    
    // Compare password
    const isMatch = await bcrypt.compare('admin123', user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return;
    }
    console.log('✅ Password matches');
    
    console.log('🎉 Login logic works correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testLoginDirect();