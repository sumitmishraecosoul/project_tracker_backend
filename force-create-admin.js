const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function forceCreateAdmin() {
  try {
    console.log('👤 Force creating admin user...');
    
    // Connect to MongoDB using the same URI as server
    const mongoUri = 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB (asana_dev)');
    
    // Delete existing admin user if exists
    await User.deleteOne({ email: 'admin@system.local' });
    console.log('🗑️ Deleted existing admin user');
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@system.local',
      password: hashedPassword,
      role: 'admin',
      employeeNumber: 'ADMIN001',
      status: 'active'
    });
    
    console.log('✅ Created admin user:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('   Role:', adminUser.role);
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

forceCreateAdmin();
