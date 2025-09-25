const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testServerStatus = async () => {
  console.log('🔍 Testing Server Status...');
  
  try {
    // Test basic server response
    console.log('1. Testing server connectivity...');
    const response = await axios.get(`${BASE_URL}/auth/register`, { timeout: 5000 });
    console.log('✅ Server is responding');
    console.log('Response status:', response.status);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running - Connection refused');
    } else if (error.response) {
      console.log('✅ Server is running - Got response:', error.response.status);
      console.log('Response data:', error.response.data);
    } else {
      console.log('❌ Server error:', error.message);
    }
    return false;
  }
};

testServerStatus().catch(console.error);

