const mongoose = require('mongoose');
require('dotenv').config();

async function setupTestAdminBrand() {
    console.log('🏢 Setting up Test Admin Brand...');
    
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const User = require('./models/User');
        const Brand = require('./models/Brand');
        const UserBrand = require('./models/UserBrand');
        
        // Find test admin
        const testAdmin = await User.findOne({ email: 'testadmin@example.com' });
        if (!testAdmin) {
            console.log('❌ Test admin not found');
            return;
        }
        
        console.log(`✅ Found test admin: ${testAdmin.name}`);
        
        // Create a brand for the test admin
        const timestamp = Date.now();
        const testBrand = new Brand({
            name: `Test Brand ${timestamp}`,
            description: 'Test brand for comprehensive testing',
            status: 'active',
            created_by: testAdmin._id,
            settings: {
                theme: 'light',
                notifications: true
            }
        });
        
        await testBrand.save();
        console.log(`✅ Created brand: ${testBrand.name} (${testBrand._id})`);
        
        // Associate admin with brand
        const userBrand = new UserBrand({
            user_id: testAdmin._id,
            brand_id: testBrand._id,
            role: 'admin',
            permissions: ['all']
        });
        
        await userBrand.save();
        console.log('✅ Associated admin with brand');
        
        // Update user's current brand
        testAdmin.currentBrand = testBrand._id;
        await testAdmin.save();
        console.log('✅ Updated user current brand');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        console.log('\n🎉 Test admin setup complete!');
        console.log(`   Admin: ${testAdmin.email}`);
        console.log(`   Brand: ${testBrand.name} (${testBrand._id})`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setupTestAdminBrand();
