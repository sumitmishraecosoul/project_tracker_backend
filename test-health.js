const axios = require('axios');

async function testHealth() {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/health');
    console.log('✅ Health endpoint working:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.response?.data || error.message);
    return false;
  }
}

testHealth();

