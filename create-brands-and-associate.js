const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const UserBrand = require('./models/UserBrand');
const User = require('./models/User');

async function createBrandsAndAssociate() {
  try {
    console.log('🏢 Creating brands and associating with admin...');
    
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
    
    // Create three brands
    const brandsData = [
      {
        name: 'Thrive',
        description: 'Thrive - Leading technology solutions company',
        logo: 'https://example.com/thrive-logo.png',
        settings: {
          timezone: 'America/New_York',
          date_format: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en'
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          max_users: 100,
          max_projects: 200
        }
      },
      {
        name: 'Kinetica',
        description: 'Kinetica - Data analytics and insights platform',
        logo: 'https://example.com/kinetica-logo.png',
        settings: {
          timezone: 'America/Los_Angeles',
          date_format: 'MM/DD/YYYY',
          currency: 'USD',
          language: 'en'
        },
        subscription: {
          plan: 'enterprise',
          status: 'active',
          max_users: -1, // unlimited
          max_projects: -1 // unlimited
        }
      },
      {
        name: 'Brillio',
        description: 'Brillio - Digital transformation and consulting services',
        logo: 'https://example.com/brillio-logo.png',
        settings: {
          timezone: 'Asia/Kolkata',
          date_format: 'DD/MM/YYYY',
          currency: 'INR',
          language: 'en'
        },
        subscription: {
          plan: 'basic',
          status: 'active',
          max_users: 25,
          max_projects: 50
        }
      }
    ];
    
    console.log('📝 Creating brands...');
    const createdBrands = [];
    
    for (const brandData of brandsData) {
      const brand = await Brand.create({
        ...brandData,
        created_by: adminUser._id
      });
      createdBrands.push(brand);
      console.log(`✅ Created brand: ${brand.name} (${brand.slug})`);
    }
    
    // Associate admin user with all brands
    console.log('🔗 Associating admin with brands...');
    for (const brand of createdBrands) {
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
      console.log(`✅ Associated admin with ${brand.name} as owner`);
    }
    
    console.log('\n🎉 Setup completed successfully!');
    console.log(`📊 Created ${createdBrands.length} brands`);
    console.log(`🔗 Associated admin with all brands`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createBrandsAndAssociate();



