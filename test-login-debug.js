const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

async function testLogin() {
  console.log('Testing login with admin user...');
  
  const loginData = {
    email: 'admin@system.local',
    password: 'admin123'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Login failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testLogin();

