const axios = require('axios');

async function testTaskAPIs() {
  try {
    console.log('🔍 Testing task API endpoints...\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Test 1: Login to get token
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test 2: Get brand tasks (main endpoint)
    console.log('2️⃣ Testing brand tasks endpoint...');
    try {
      const brandTasksResponse = await axios.get(`${baseURL}/brands/68e1ddaa9ee979a7408876e9/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Brand tasks: ${brandTasksResponse.data.data?.tasks?.length || 0} tasks found`);
      console.log(`   Response structure:`, Object.keys(brandTasksResponse.data));
    } catch (error) {
      console.log(`❌ Brand tasks failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    // Test 3: Get project tasks (brand-specific)
    console.log('\n3️⃣ Testing brand project tasks endpoint...');
    try {
      const projectTasksResponse = await axios.get(`${baseURL}/brands/68e1ddaa9ee979a7408876e9/projects/68e289b7ab2bcc9d4de68216/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Brand project tasks: ${projectTasksResponse.data.data?.length || 0} tasks found`);
      console.log(`   Response structure:`, Object.keys(projectTasksResponse.data));
    } catch (error) {
      console.log(`❌ Brand project tasks failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    // Test 4: Get project tasks (global)
    console.log('\n4️⃣ Testing global project tasks endpoint...');
    try {
      const globalProjectTasksResponse = await axios.get(`${baseURL}/projects/68e289b7ab2bcc9d4de68216/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Global project tasks: ${globalProjectTasksResponse.data?.length || 0} tasks found`);
      console.log(`   Response structure:`, Object.keys(globalProjectTasksResponse.data));
    } catch (error) {
      console.log(`❌ Global project tasks failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    // Test 5: Get all tasks (global)
    console.log('\n5️⃣ Testing global all tasks endpoint...');
    try {
      const allTasksResponse = await axios.get(`${baseURL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Global all tasks: ${allTasksResponse.data?.length || 0} tasks found`);
    } catch (error) {
      console.log(`❌ Global all tasks failed: ${error.response?.data?.error?.message || error.message}`);
    }
    
    console.log('\n✅ API testing completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTaskAPIs();
