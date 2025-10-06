const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdminDirect() {
  try {
    console.log('👤 Creating admin user directly...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'admin@system.local' });
    console.log('🗑️ Deleted existing admin user');
    
    // Create admin user with plain password (let middleware handle hashing)
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@system.local',
      password: 'admin123', // Plain password - middleware will hash it
      role: 'admin',
      employeeNumber: 'ADMIN001',
      status: 'active'
    });
    
    console.log('✅ Created admin user:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Password: admin123 (will be hashed by middleware)');
    
    // Test the password
    const testMatch = await bcrypt.compare('admin123', adminUser.password);
    console.log('   Password test:', testMatch ? '✅ PASS' : '❌ FAIL');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminDirect();

