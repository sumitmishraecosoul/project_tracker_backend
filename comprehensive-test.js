const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function comprehensiveTest() {
  try {
    console.log('🧪 Comprehensive Login Test...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Admin user found:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Password field exists:', !!adminUser.password);
    console.log('   Security hash exists:', !!adminUser.security?.password_hash);
    
    // Test password comparison
    const testPassword = 'admin123';
    console.log('\n🔐 Testing password comparison...');
    
    if (adminUser.password) {
      const passwordMatch = await bcrypt.compare(testPassword, adminUser.password);
      console.log('   Password field match:', passwordMatch);
    }
    
    if (adminUser.security?.password_hash) {
      const securityMatch = await bcrypt.compare(testPassword, adminUser.security.password_hash);
      console.log('   Security hash match:', securityMatch);
    }
    
    // Test the exact login logic
    console.log('\n🔍 Testing exact login logic...');
    const { email, password } = { email: 'admin@system.local', password: 'admin123' };
    
    const user = await User.findOne({ email });
    console.log('   User found:', !!user);
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('   Password match:', isMatch);
      
      if (isMatch) {
        console.log('✅ LOGIN SHOULD WORK!');
      } else {
        console.log('❌ LOGIN WILL FAIL - Password mismatch');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

comprehensiveTest();

