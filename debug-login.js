const axios = require('axios');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login...');
    
    // Test server connectivity
    try {
      const response = await axios.get('http://localhost:5000/api/brands');
      console.log('✅ Server is responding');
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
      return;
    }
    
    // Test login
    console.log('🔐 Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

debugLogin();

