const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const UserBrand = require('./models/UserBrand');
const User = require('./models/User');

async function checkBrands() {
  try {
    console.log('🔍 Checking brands and user associations...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asana';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Check brands
    const brands = await Brand.find({});
    console.log(`📊 Found ${brands.length} brands:`);
    brands.forEach((brand, index) => {
      console.log(`${index + 1}. ${brand.name} (${brand.slug}) - ${brand.status}`);
    });
    
    // Check admin user
    const adminUser = await User.findOne({ email: 'admin@system.local' });
    console.log(`\n👤 Admin user: ${adminUser ? adminUser.name : 'NOT FOUND'}`);
    
    // Check user-brand associations
    const userBrands = await UserBrand.find({ user_id: adminUser?._id });
    console.log(`🔗 User-brand associations: ${userBrands.length}`);
    userBrands.forEach((ub, index) => {
      console.log(`${index + 1}. Brand: ${ub.brand_id} - Role: ${ub.role}`);
    });
    
    if (brands.length > 0 && userBrands.length === 0) {
      console.log('\n⚠️ Admin user is not associated with any brands!');
      console.log('💡 Need to create user-brand associations');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkBrands();

