const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestAdmin() {
    console.log('🔧 Creating Test Admin...');
    
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana_dev';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const User = require('./models/User');
        
        // Check if test admin already exists
        const existingAdmin = await User.findOne({ email: 'testadmin@example.com' });
        if (existingAdmin) {
            console.log('✅ Test admin already exists');
            await mongoose.disconnect();
            return;
        }
        
        // Create new test admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const testAdmin = new User({
            name: 'Test Admin',
            email: 'testadmin@example.com',
            password: hashedPassword,
            role: 'admin',
            employeeNumber: 'TEST-ADMIN-001'
        });
        
        await testAdmin.save();
        console.log('✅ Test admin created successfully');
        console.log('   Email: testadmin@example.com');
        console.log('   Password: admin123');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestAdmin();
