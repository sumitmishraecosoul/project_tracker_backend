const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const Brand = require('./models/Brand');
const UserBrand = require('./models/UserBrand');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

async function migrateToBrandSupport() {
  try {
    console.log('🚀 Starting brand support migration...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Step 1: Get first admin user or create a default one
    console.log('👤 Finding admin user...');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // If no admin user exists, get the first user
      adminUser = await User.findOne();
    }
    
    if (!adminUser) {
      console.log('👤 No users found, creating default admin user...');
      // Create a default admin user
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@system.local',
        password: 'admin123', // This will be hashed by the pre-save middleware
        role: 'admin',
        employeeNumber: 'ADMIN001',
        status: 'active'
      });
      console.log(`✅ Created default admin user: ${adminUser.name} (${adminUser.email})`);
    } else {
      console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);
    }

    // Step 2: Create default brand or get existing one
    console.log('📝 Creating default brand...');
    let defaultBrand = await Brand.findOne({ name: 'Default Brand' });
    
    if (!defaultBrand) {
      defaultBrand = await Brand.create({
        name: 'Default Brand',
        slug: 'default-brand',
        description: 'Default brand for existing data migration',
        status: 'active',
        settings: {
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en'
        },
        subscription: {
          plan: 'free',
          status: 'active',
          max_users: 5,
          max_projects: 10
        },
        compliance: {
          data_retention_days: 2555,
          gdpr_compliant: true,
          audit_logging: true,
          data_encryption: true
        },
        created_by: adminUser._id
      });
      console.log(`✅ Created default brand: ${defaultBrand._id}`);
    } else {
      console.log(`✅ Found existing default brand: ${defaultBrand._id}`);
    }

    // Step 3: Get all users and assign them to default brand
    console.log('👥 Assigning users to default brand...');
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let assignedCount = 0;
    for (const user of users) {
      // Check if user-brand relationship already exists
      const existingUserBrand = await UserBrand.findOne({
        user_id: user._id,
        brand_id: defaultBrand._id
      });

      if (!existingUserBrand) {
        // Create UserBrand relationship
        await UserBrand.create({
          user_id: user._id,
          brand_id: defaultBrand._id,
          role: user.role === 'admin' ? 'owner' : 'member',
          permissions: {
            can_create_projects: user.role === 'admin',
            can_edit_projects: user.role === 'admin',
            can_delete_projects: user.role === 'admin',
            can_view_all_projects: true,
            can_create_tasks: true,
            can_edit_tasks: true,
            can_delete_tasks: user.role === 'admin',
            can_assign_tasks: user.role === 'admin',
            can_manage_users: user.role === 'admin',
            can_invite_users: user.role === 'admin',
            can_remove_users: user.role === 'admin',
            can_view_analytics: user.role === 'admin',
            can_export_data: user.role === 'admin',
            can_generate_reports: user.role === 'admin',
            can_manage_brand_settings: user.role === 'admin',
            can_manage_billing: user.role === 'admin'
          },
          status: 'active'
        });
        assignedCount++;
      }
    }
    console.log(`✅ Assigned ${assignedCount} users to default brand (${users.length - assignedCount} already assigned)`);

    // Step 4: Update projects with brand_id
    console.log('📁 Updating projects with brand_id...');
    const projectUpdateResult = await Project.updateMany(
      { brand_id: { $exists: false } },
      { $set: { brand_id: defaultBrand._id } }
    );
    console.log(`✅ Updated ${projectUpdateResult.modifiedCount} projects`);

    // Step 5: Update tasks with brand_id
    console.log('📋 Updating tasks with brand_id...');
    const taskUpdateResult = await Task.updateMany(
      { brand_id: { $exists: false } },
      { $set: { brand_id: defaultBrand._id } }
    );
    console.log(`✅ Updated ${taskUpdateResult.modifiedCount} tasks`);

    // Step 6: Create database indexes for performance
    console.log('🔍 Creating database indexes...');
    
    try {
      // Brand indexes
      await Brand.collection.createIndex({ name: 1 }, { background: true });
      await Brand.collection.createIndex({ slug: 1 }, { background: true });
      await Brand.collection.createIndex({ status: 1 }, { background: true });
      
      // UserBrand indexes
      await UserBrand.collection.createIndex({ user_id: 1, brand_id: 1 }, { unique: true, background: true });
      await UserBrand.collection.createIndex({ brand_id: 1, role: 1 }, { background: true });
      await UserBrand.collection.createIndex({ brand_id: 1, status: 1 }, { background: true });
      
      // Project indexes
      await Project.collection.createIndex({ brand_id: 1 }, { background: true });
      await Project.collection.createIndex({ brand_id: 1, status: 1 }, { background: true });
      await Project.collection.createIndex({ brand_id: 1, createdBy: 1 }, { background: true });
      
      // Task indexes
      await Task.collection.createIndex({ brand_id: 1 }, { background: true });
      await Task.collection.createIndex({ brand_id: 1, projectId: 1 }, { background: true });
      await Task.collection.createIndex({ brand_id: 1, assignedTo: 1 }, { background: true });
      await Task.collection.createIndex({ brand_id: 1, status: 1 }, { background: true });
      
      console.log('✅ Created database indexes');
    } catch (error) {
      if (error.code === 86) { // IndexKeySpecsConflict
        console.log('⚠️  Some indexes already exist, skipping...');
      } else {
        throw error;
      }
    }

    // Step 7: Verify migration
    console.log('🔍 Verifying migration...');
    
    const brandCount = await Brand.countDocuments();
    const userBrandCount = await UserBrand.countDocuments();
    const projectCount = await Project.countDocuments({ brand_id: defaultBrand._id });
    const taskCount = await Task.countDocuments({ brand_id: defaultBrand._id });
    
    console.log(`📊 Migration Results:`);
    console.log(`   - Brands: ${brandCount}`);
    console.log(`   - User-Brand relationships: ${userBrandCount}`);
    console.log(`   - Projects with brand_id: ${projectCount}`);
    console.log(`   - Tasks with brand_id: ${taskCount}`);

    console.log('🎉 Brand support migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToBrandSupport()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateToBrandSupport;
