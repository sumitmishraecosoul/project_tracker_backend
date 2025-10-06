const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createNewAdmin() {
  try {
    console.log('👤 Creating new admin user...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'admin@system.local' });
    console.log('🗑️ Deleted existing admin user');
    
    // Create new admin user with correct password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@system.local',
      password: hashedPassword,
      role: 'admin',
      employeeNumber: 'ADMIN001',
      status: 'active'
    });
    
    console.log('✅ Created new admin user:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Password: admin123');
    
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

createNewAdmin();

