const axios = require('axios');

async function debugCreateBrand() {
    console.log('🔍 Debugging Create Brand Response...');
    
    try {
        // First login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Create brand
        const createResponse = await axios.post('http://localhost:5000/api/brands', {
            name: 'Debug Test Brand ' + Date.now(),
            description: 'Debug test brand',
            settings: {
                theme: 'light',
                notifications: true
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📊 Create Brand Response:');
        console.log('Status:', createResponse.status);
        console.log('Data:', JSON.stringify(createResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugCreateBrand();
