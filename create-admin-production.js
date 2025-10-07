const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdminInProduction() {
  try {
    console.log('🔌 Connecting to Production MongoDB...');
    const MONGODB_URI = 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to Production MongoDB');

    // Check if admin user already exists
    console.log('🔍 Checking for existing admin user in production...');
    const existingAdmin = await User.findOne({ email: 'admin@system.local' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in production');
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Department: ${existingAdmin.department}`);
      return;
    }

    console.log('❌ Admin user not found in production, creating new one...');

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
    
    console.log('✅ Admin user created successfully in production');
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Department: ${adminUser.department}`);
    console.log(`   Password: admin123`);
    
    // Verify the user was saved
    const savedUser = await User.findOne({ email: 'admin@system.local' });
    if (savedUser) {
      console.log('✅ User verified in production database');
    } else {
      console.log('❌ User not found in production database after creation');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from Production MongoDB');
  }
}

createAdminInProduction();

