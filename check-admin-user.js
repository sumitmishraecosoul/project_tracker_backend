const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('   Name:', adminUser.name);
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Status:', adminUser.status);
      console.log('   Employee Number:', adminUser.employeeNumber);
      console.log('   Password hash length:', adminUser.password.length);
    } else {
      console.log('❌ Admin user not found');
      
      // List all users
      const allUsers = await User.find({});
      console.log('📊 All users in database:');
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAdminUser();
