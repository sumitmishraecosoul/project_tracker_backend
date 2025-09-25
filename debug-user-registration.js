const axios = require('axios');

async function debugUserRegistration() {
    console.log('🔍 Debugging User Registration Response...');
    
    try {
        const timestamp = Date.now();
        const userEmail = `debuguser${timestamp}@example.com`;
        
        const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Debug User ' + timestamp,
            email: userEmail,
            password: 'test123',
            employeeNumber: 'EMP-DEBUG-' + timestamp
        });
        
        console.log('📊 Registration Response:');
        console.log('Status:', registerResponse.status);
        console.log('Data:', JSON.stringify(registerResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugUserRegistration();
