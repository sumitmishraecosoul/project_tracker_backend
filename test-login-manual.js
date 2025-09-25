const axios = require('axios');

async function testLoginManual() {
    console.log('🔍 Testing Login Manually...');
    
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Login failed:');
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('Message:', error.message);
    }
}

testLoginManual();
