const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing Login API...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sumitmishraecosoul@gmail.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testLogin();
