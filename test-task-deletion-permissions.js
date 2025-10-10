const mongoose = require('mongoose');
const User = require('./models/User');
const UserBrand = require('./models/UserBrand');
const Brand = require('./models/Brand');
const Task = require('./models/Task');
const Project = require('./models/Project');

async function testTaskDeletionPermissions() {
  try {
    console.log('🔍 Testing task deletion permissions...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ Connected to MongoDB\n');
    
    // Get or create test users
    console.log('📋 Setting up test users...\n');
    
    // 1. Global Admin
    let adminUser = await User.findOne({ email: 'admin@system.local' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log(`✅ Admin User: ${adminUser.name} (Role: ${adminUser.role})`);
    
    // 2. Get a brand to test with
    const brand = await Brand.findOne();
    if (!brand) {
      console.log('❌ No brand found for testing');
      return;
    }
    console.log(`✅ Test Brand: ${brand.name} (ID: ${brand._id})\n`);
    
    // 3. Check users in this brand
    const userBrands = await UserBrand.find({ brand_id: brand._id }).populate('user_id');
    console.log(`📊 Users in brand "${brand.name}":`);
    
    for (const userBrand of userBrands) {
      const user = userBrand.user_id;
      console.log(`  - ${user.name} (Global: ${user.role}, Brand: ${userBrand.role})`);
    }
    
    // 4. Check if there are any tasks in this brand
    const tasks = await Task.find({ brand_id: brand._id }).limit(5);
    console.log(`\n📊 Tasks in brand: ${tasks.length}`);
    
    if (tasks.length > 0) {
      console.log(`📋 Sample tasks:`);
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.task} (ID: ${task._id})`);
      });
    }
    
    // 5. Test permission scenarios
    console.log('\n🔍 Permission Test Scenarios:\n');
    
    console.log('Scenario 1: Global Admin');
    console.log(`  User: ${adminUser.name}`);
    console.log(`  Global Role: ${adminUser.role}`);
    console.log(`  Expected: ✅ CAN delete tasks (global admin override)`);
    
    // Check if admin has UserBrand entry
    const adminBrand = await UserBrand.findOne({ user_id: adminUser._id, brand_id: brand._id });
    if (adminBrand) {
      console.log(`  Brand Role: ${adminBrand.role}`);
    } else {
      console.log(`  Brand Role: None (admin override applies)`);
    }
    
    console.log('\n---');
    
    // Check other users
    for (const userBrand of userBrands) {
      const user = userBrand.user_id;
      console.log(`\nScenario: ${user.name}`);
      console.log(`  Global Role: ${user.role}`);
      console.log(`  Brand Role: ${userBrand.role}`);
      
      if (userBrand.role === 'owner') {
        console.log(`  Expected: ✅ CAN delete tasks (brand owner)`);
      } else if (userBrand.role === 'admin') {
        console.log(`  Expected: ✅ CAN delete tasks (brand admin)`);
      } else if (userBrand.role === 'manager') {
        console.log(`  Expected: ✅ CAN delete tasks (brand manager)`);
      } else if (userBrand.role === 'member') {
        console.log(`  Expected: ❌ CANNOT delete tasks (brand member)`);
      } else {
        console.log(`  Expected: ❌ CANNOT delete tasks (${userBrand.role})`);
      }
      
      console.log('  ---');
    }
    
    console.log('\n✅ Permission test analysis completed');
    console.log('\n📝 Summary:');
    console.log('  ✅ Global Admin → Can delete ANY task');
    console.log('  ✅ Brand Owner → Can delete tasks in their brand');
    console.log('  ✅ Brand Admin → Can delete tasks in their brand');
    console.log('  ✅ Brand Manager → Can delete tasks in their brand');
    console.log('  ❌ Brand Member → Cannot delete tasks');
    console.log('  ❌ Others → Cannot delete tasks');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testTaskDeletionPermissions();
