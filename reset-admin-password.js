const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    // Reset password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    adminUser.password = hashedPassword;
    adminUser.security.password_hash = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Admin password reset successfully');
    console.log('   Email: admin@system.local');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetAdminPassword();

