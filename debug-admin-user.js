const mongoose = require('mongoose');
const User = require('./models/User');

async function debugAdminUser() {
  try {
    console.log('🔍 Debugging admin user...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ Connected to MongoDB\n');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Admin user details:');
    console.log(`  ID: ${adminUser._id}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Role: ${adminUser.role}`);
    console.log(`  Department: ${adminUser.department || 'null'}`);
    console.log(`  Name: ${adminUser.name}`);
    
    // Check if admin is assigned to any tasks
    const Task = require('./models/Task');
    const tasksAssignedToAdmin = await Task.countDocuments({ assignedTo: adminUser._id });
    const tasksCreatedByAdmin = await Task.countDocuments({ reporter: adminUser._id });
    
    console.log(`\n📊 Tasks assigned to admin: ${tasksAssignedToAdmin}`);
    console.log(`📊 Tasks created by admin: ${tasksCreatedByAdmin}`);
    
    // Check total tasks
    const totalTasks = await Task.countDocuments();
    console.log(`📊 Total tasks in database: ${totalTasks}`);
    
    // Check tasks by brand
    const tasksByBrand = await Task.aggregate([
      { $group: { _id: '$brand_id', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Tasks by brand:');
    tasksByBrand.forEach(brand => {
      console.log(`  Brand ${brand._id}: ${brand.count} tasks`);
    });
    
    console.log('\n✅ Admin user debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugAdminUser();
