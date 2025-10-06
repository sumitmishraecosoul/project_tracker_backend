const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkAndCreateAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker');
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    console.log('🔍 Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@system.local' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Department: ${existingAdmin.department}`);
      return;
    }

    console.log('❌ Admin user not found, creating new one...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@system.local',
      password: hashedPassword,
      role: 'admin',
      employeeNumber: 'ADMIN001',
      department: 'Data Analytics'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully');
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Department: ${adminUser.department}`);
    console.log(`   Password: admin123`);
    
    // Verify the user was saved
    const savedUser = await User.findOne({ email: 'admin@system.local' });
    if (savedUser) {
      console.log('✅ User verified in database');
    } else {
      console.log('❌ User not found in database after creation');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAndCreateAdmin();

