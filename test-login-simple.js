const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing Login...');
    console.log('📊 Server should be using asana_dev database');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    console.log('   Status:', response.status);
    console.log('   Token length:', response.data.data.token.length);
    console.log('   User:', response.data.data.user.name);
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message);
    console.log('   Full error:', error.response?.data);
  }
}

testLogin();
