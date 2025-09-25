const axios = require('axios');

async function debugBrandsResponse() {
    console.log('🔍 Debugging Brands Response...');
    
    try {
        // First login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Get brands
        const brandsResponse = await axios.get('http://localhost:5000/api/brands', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📊 Brands Response:');
        console.log('Status:', brandsResponse.status);
        console.log('Data:', JSON.stringify(brandsResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugBrandsResponse();
