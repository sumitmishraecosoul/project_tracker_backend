const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const Brand = require('./models/Brand');
const UserBrand = require('./models/UserBrand');
const User = require('./models/User');

async function setupBrands() {
  try {
    console.log('🚀 Setting up brands...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);

    // Remove Default Brand
    console.log('🗑️ Removing Default Brand...');
    const defaultBrand = await Brand.findOne({ name: 'Default Brand' });
    if (defaultBrand) {
      // Remove all user-brand relationships for default brand
      await UserBrand.deleteMany({ brand_id: defaultBrand._id });
      // Remove the default brand
      await Brand.findByIdAndDelete(defaultBrand._id);
      console.log('✅ Removed Default Brand');
    } else {
      console.log('⚠️ Default Brand not found');
    }

    // Create three new brands
    const brands = [
      {
        name: 'Thrive',
        slug: 'thrive',
        description: 'Thrive - Leading technology solutions company',
        logo: 'https://example.com/thrive-logo.png',
        settings: {
          timezone: 'America/New_York',
          date_format: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
          working_hours: {
            start: '09:00',
            end: '17:00',
            timezone: 'America/New_York'
          }
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          max_users: 100,
          max_projects: 200,
          features: ['unlimited_projects', 'advanced_analytics', 'api_access']
        }
      },
      {
        name: 'Kinetica',
        slug: 'kinetica',
        description: 'Kinetica - Data analytics and insights platform',
        logo: 'https://example.com/kinetica-logo.png',
        settings: {
          timezone: 'America/Los_Angeles',
          date_format: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en',
          working_hours: {
            start: '08:00',
            end: '18:00',
            timezone: 'America/Los_Angeles'
          }
        },
        subscription: {
          plan: 'enterprise',
          status: 'active',
          max_users: -1, // unlimited
          max_projects: -1, // unlimited
          features: ['unlimited_projects', 'unlimited_tasks', 'advanced_analytics', 'api_access', 'priority_support', 'white_label', 'sso', 'audit_logs']
        }
      },
      {
        name: 'Brillio',
        slug: 'brillio',
        description: 'Brillio - Digital transformation and consulting services',
        logo: 'https://example.com/brillio-logo.png',
        settings: {
          timezone: 'Asia/Kolkata',
          date_format: 'DD/MM/YYYY',
          currency: 'INR',
          language: 'en',
          working_hours: {
            start: '09:00',
            end: '18:00',
            timezone: 'Asia/Kolkata'
          }
        },
        subscription: {
          plan: 'basic',
          status: 'active',
          max_users: 25,
          max_projects: 50,
          features: ['unlimited_projects', 'api_access']
        }
      }
    ];

    console.log('📝 Creating brands...');
    const createdBrands = [];
    
    for (const brandData of brands) {
      const brand = await Brand.create({
        ...brandData,
        created_by: adminUser._id
      });
      createdBrands.push(brand);
      console.log(`✅ Created brand: ${brand.name} (${brand._id})`);
    }

    // Assign admin user to all brands as owner
    console.log('👥 Assigning admin user to all brands...');
    for (const brand of createdBrands) {
      // Check if relationship already exists
      const existingUserBrand = await UserBrand.findOne({
        user_id: adminUser._id,
        brand_id: brand._id
      });

      if (!existingUserBrand) {
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
        console.log(`✅ Assigned admin to ${brand.name} as owner`);
      } else {
        console.log(`⚠️ Admin already assigned to ${brand.name}`);
      }
    }

    // Verify setup
    console.log('🔍 Verifying setup...');
    const brandCount = await Brand.countDocuments();
    const userBrandCount = await UserBrand.countDocuments();
    
    console.log(`📊 Setup Results:`);
    console.log(`   - Brands: ${brandCount}`);
    console.log(`   - User-Brand relationships: ${userBrandCount}`);
    
    // List all brands
    const allBrands = await Brand.find({}).populate('created_by', 'name email');
    console.log(`\n📋 Created Brands:`);
    allBrands.forEach(brand => {
      console.log(`   - ${brand.name} (${brand.slug}) - ${brand.subscription.plan} plan`);
    });

    console.log('\n🎉 Brand setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run setup if called directly
if (require.main === module) {
  setupBrands()
    .then(() => {
      console.log('✅ Brand setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Brand setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupBrands;

