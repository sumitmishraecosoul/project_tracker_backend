const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

async function testLoginDirect() {
  console.log('Testing login endpoint directly...');
  console.log('Base URL:', BASE_URL);
  
  const loginData = {
    email: 'admin@system.local',
    password: 'admin123'
  };
  
  console.log('Login data:', loginData);
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Login successful');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Login failed');
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Full error:', error.message);
  }
}

testLoginDirect();

