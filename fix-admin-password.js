const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('🔐 Fixing admin password...');
    
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
    
    // Set password for both fields
    const hashedPassword = await bcrypt.hash('admin123', 12);
    adminUser.password = hashedPassword;
    adminUser.security.password_hash = hashedPassword;
    
    // Save the user (this will trigger pre-save middleware)
    await adminUser.save();
    
    console.log('✅ Admin password fixed successfully');
    console.log('   Email: admin@system.local');
    console.log('   Password: admin123');
    console.log('   Password field: SET');
    console.log('   Security hash field: SET');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAdminPassword();

