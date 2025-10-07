const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const UserBrand = require('./models/UserBrand');
const User = require('./models/User');

async function associateAdminBrands() {
  try {
    console.log('🔗 Associating admin user with brands...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana_dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    console.log(`👤 Found admin user: ${adminUser.name}`);
    
    // Get all brands
    const brands = await Brand.find({});
    console.log(`📊 Found ${brands.length} brands`);
    
    if (brands.length === 0) {
      console.log('❌ No brands found. Need to create brands first.');
      return;
    }
    
    // Associate admin user with all brands
    let associatedCount = 0;
    for (const brand of brands) {
      // Check if association already exists
      const existingAssociation = await UserBrand.findOne({
        user_id: adminUser._id,
        brand_id: brand._id
      });
      
      if (!existingAssociation) {
        await UserBrand.create({
          user_id: adminUser._id,
          brand_id: brand._id,
          role: 'owner',
          permissions: {
            can_create_projects: true,
            can_edit_projects: true,
            can_delete_projects: true,
            can_view_all_projects: true,
            can_create_tasks: true,
            can_edit_tasks: true,
            can_delete_tasks: true,
            can_assign_tasks: true,
            can_manage_users: true,
            can_invite_users: true,
            can_remove_users: true,
            can_view_analytics: true,
            can_export_data: true,
            can_generate_reports: true,
            can_manage_brand_settings: true,
            can_manage_billing: true
          },
          status: 'active'
        });
        associatedCount++;
        console.log(`✅ Associated admin with ${brand.name}`);
      } else {
        console.log(`⚠️ Admin already associated with ${brand.name}`);
      }
    }
    
    console.log(`\n🎉 Associated admin with ${associatedCount} brands`);
    
    // Verify associations
    const userBrands = await UserBrand.find({ user_id: adminUser._id });
    console.log(`📊 Total user-brand associations: ${userBrands.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

associateAdminBrands();

