const axios = require('axios');

async function testGlobalTasksDirect() {
  try {
    console.log('🔍 Testing global tasks API directly...\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test global tasks with detailed logging
    console.log('🔍 Testing global tasks endpoint with detailed response...');
    try {
      const response = await axios.get(`${baseURL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`📊 Response type: ${typeof response.data}`);
      console.log(`📊 Response length: ${Array.isArray(response.data) ? response.data.length : 'Not an array'}`);
      console.log(`📊 Response keys: ${Object.keys(response.data)}`);
      
      if (Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} tasks`);
        if (response.data.length > 0) {
          console.log(`📋 First task: ${response.data[0].task}`);
        }
      } else {
        console.log(`📋 Response structure:`, response.data);
      }
      
    } catch (error) {
      console.log(`❌ Global tasks failed: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      if (error.response?.data) {
        console.log(`📋 Error response:`, error.response.data);
      }
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGlobalTasksDirect();
