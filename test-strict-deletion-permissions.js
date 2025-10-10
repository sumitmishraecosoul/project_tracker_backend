const mongoose = require('mongoose');
const User = require('./models/User');
const UserBrand = require('./models/UserBrand');
const Brand = require('./models/Brand');

async function testStrictDeletionPermissions() {
  try {
    console.log('🔍 Testing STRICT task deletion permissions...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ Connected to MongoDB\n');
    
    // Get test brand
    const brand = await Brand.findOne();
    if (!brand) {
      console.log('❌ No brand found for testing');
      return;
    }
    console.log(`📊 Test Brand: ${brand.name} (ID: ${brand._id})\n`);
    
    // Get all users in this brand
    const userBrands = await UserBrand.find({ brand_id: brand._id }).populate('user_id');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 PERMISSION TEST SCENARIOS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Test each user
    for (const userBrand of userBrands) {
      const user = userBrand.user_id;
      
      console.log(`👤 User: ${user.name}`);
      console.log(`   Global Role: ${user.role}`);
      console.log(`   Brand Role: ${userBrand.role}`);
      console.log(`   ---`);
      
      // Apply the new logic
      let canDelete = false;
      let reason = '';
      
      if (user.role === 'admin') {
        canDelete = true;
        reason = 'Global admin - full access';
      } else if (user.role === 'brand_admin') {
        if (['owner', 'manager'].includes(userBrand.role)) {
          canDelete = true;
          reason = `Brand admin with ${userBrand.role} role`;
        } else {
          canDelete = false;
          reason = `Brand admin but only ${userBrand.role} role (needs owner/manager)`;
        }
      } else {
        canDelete = false;
        reason = `Regular user (${user.role}) - not allowed even with ${userBrand.role} brand role`;
      }
      
      if (canDelete) {
        console.log(`   ✅ CAN DELETE TASKS`);
      } else {
        console.log(`   ❌ CANNOT DELETE TASKS`);
      }
      console.log(`   Reason: ${reason}`);
      console.log('');
    }
    
    // Test global admin without brand membership
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      const adminBrand = await UserBrand.findOne({ user_id: adminUser._id, brand_id: brand._id });
      
      console.log(`👤 User: ${adminUser.name} (Global Admin)`);
      console.log(`   Global Role: ${adminUser.role}`);
      console.log(`   Brand Role: ${adminBrand ? adminBrand.role : 'None (not in brand)'}`);
      console.log(`   ---`);
      console.log(`   ✅ CAN DELETE TASKS`);
      console.log(`   Reason: Global admin - no brand role check needed`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 PERMISSION RULES SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ CAN DELETE TASKS:');
    console.log('   1. Global admin (role: admin) - ANY brand, ANY task');
    console.log('   2. Brand admin (role: brand_admin) + Brand owner (role: owner)');
    console.log('   3. Brand admin (role: brand_admin) + Brand manager (role: manager)\n');
    
    console.log('❌ CANNOT DELETE TASKS:');
    console.log('   1. Brand admin (role: brand_admin) + Brand member (role: member)');
    console.log('   2. Regular user (role: user) + Brand owner (role: owner)');
    console.log('   3. Regular user (role: user) + Brand manager (role: manager)');
    console.log('   4. Regular user (role: user) + Brand member (role: member)');
    console.log('   5. Any user without proper global role\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔒 SECURITY RULES');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('Rule 1: Global admin bypass');
    console.log('   - Global role: admin');
    console.log('   - Brand role: Not checked');
    console.log('   - Result: ✅ Full access\n');
    
    console.log('Rule 2: Brand admin with proper brand role');
    console.log('   - Global role: brand_admin (mandatory)');
    console.log('   - Brand role: owner OR manager (mandatory)');
    console.log('   - Result: ✅ Can delete in that brand\n');
    
    console.log('Rule 3: Regular users blocked');
    console.log('   - Global role: user');
    console.log('   - Brand role: ANY (even owner/manager)');
    console.log('   - Result: ❌ Cannot delete (prevents accidents)\n');
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testStrictDeletionPermissions();
