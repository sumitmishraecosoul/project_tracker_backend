const axios = require('axios');

async function testNoPagination() {
  try {
    console.log('🔍 Testing brand tasks without pagination...\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test 1: Without any limit (should return all tasks)
    console.log('1️⃣ Testing brand tasks WITHOUT limit (should return ALL tasks)...');
    try {
      const response = await axios.get(`${baseURL}/brands/68e1ddaa9ee979a7408876e9/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Tasks found: ${response.data.data?.tasks?.length || 0}`);
      console.log(`📊 Total tasks: ${response.data.data?.pagination?.totalTasks}`);
      console.log(`📊 Pagination info:`, response.data.data?.pagination);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    // Test 2: With limit=5 (should return only 5 tasks)
    console.log('\n2️⃣ Testing brand tasks WITH limit=5 (should return 5 tasks)...');
    try {
      const response = await axios.get(`${baseURL}/brands/68e1ddaa9ee979a7408876e9/tasks?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Tasks found: ${response.data.data?.tasks?.length || 0}`);
      console.log(`📊 Total tasks: ${response.data.data?.pagination?.totalTasks}`);
      console.log(`📊 Pagination info:`, response.data.data?.pagination);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    // Test 3: With limit=5 and page=2 (should return next 5 tasks)
    console.log('\n3️⃣ Testing brand tasks WITH limit=5&page=2 (should return next 5 tasks)...');
    try {
      const response = await axios.get(`${baseURL}/brands/68e1ddaa9ee979a7408876e9/tasks?limit=5&page=2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Tasks found: ${response.data.data?.tasks?.length || 0}`);
      console.log(`📊 Total tasks: ${response.data.data?.pagination?.totalTasks}`);
      console.log(`📊 Pagination info:`, response.data.data?.pagination);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNoPagination();
