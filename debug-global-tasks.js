const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');

async function debugGlobalTasks() {
  try {
    console.log('🔍 Debugging global tasks filtering...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ Connected to MongoDB\n');
    
    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    console.log(`👤 Admin user: ${adminUser.name} (${adminUser.role}) - Department: ${adminUser.department}`);
    
    // Test the exact filter logic from getAllTasks
    const filter = {};
    
    // Simulate the admin filtering logic
    const selectedDepartment = adminUser.department || 'All Departments';
    console.log(`📊 Selected department: ${selectedDepartment}`);
    
    if (adminUser.role === 'admin') {
      console.log('✅ Admin role detected - should see all tasks');
      
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        console.log('⚠️  Department filtering applied');
        // This is the problem - admin has a department, so it's filtering
      } else {
        console.log('✅ No department filtering - should see all tasks');
      }
    }
    
    // Test the actual query
    console.log('\n🔍 Testing actual query...');
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Tasks found with current filter: ${tasks.length}`);
    
    // Test without any filter
    console.log('\n🔍 Testing without any filter...');
    const allTasks = await Task.find({})
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📊 All tasks in database: ${allTasks.length}`);
    
    // Check if tasks have brand_id (they might be brand-specific)
    const tasksWithBrand = await Task.countDocuments({ brand_id: { $exists: true } });
    const tasksWithoutBrand = await Task.countDocuments({ brand_id: { $exists: false } });
    
    console.log(`\n📊 Tasks with brand_id: ${tasksWithBrand}`);
    console.log(`📊 Tasks without brand_id: ${tasksWithoutBrand}`);
    
    // Check if this is a brand-specific vs global issue
    console.log('\n🔍 Sample tasks:');
    const sampleTasks = await Task.find({}).limit(3);
    sampleTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.task} (Brand: ${task.brand_id}, Assigned: ${task.assignedTo}, Reporter: ${task.reporter})`);
    });
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugGlobalTasks();
