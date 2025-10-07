const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSimpleFlow() {
  try {
    console.log('🔍 Testing Simple Flow...\n');
    
    // 1. Register user
    console.log('1. Registering user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'admin',
      employeeNumber: `EMP${Date.now()}`
    });
    console.log('✅ User registered');
    
    // 2. Login
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerResponse.data.user.email,
      password: 'TestPassword123!'
    });
    const token = loginResponse.data.token;
    console.log('✅ User logged in');
    
    // 3. Create brand
    console.log('3. Creating brand...');
    const brandResponse = await axios.post(`${BASE_URL}/brands`, {
      name: `Test Brand ${Date.now()}`,
      description: 'Test brand description'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const brandId = brandResponse.data.data.id;
    console.log('✅ Brand created:', brandId);
    
    // 4. Create project
    console.log('4. Creating project...');
    const projectResponse = await axios.post(`${BASE_URL}/brands/${brandId}/projects`, {
      title: `Test Project ${Date.now()}`,
      description: 'Test project description',
      department: 'Supply Chain'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projectId = projectResponse.data.data._id;
    console.log('✅ Project created:', projectId);
    
    // 5. Get categories
    console.log('5. Getting categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/brands/${brandId}/projects/${projectId}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Categories retrieved:', categoriesResponse.data.data.length);
    
    // 6. Create task
    console.log('6. Creating task...');
    const taskResponse = await axios.post(`${BASE_URL}/brands/${brandId}/tasks`, {
      task: 'Test Task',
      description: 'Test task description',
      projectId: projectId,
      category_id: categoriesResponse.data.data[0]._id,
      assignedTo: '68e289b7a1234567890abce1',
      reporter: '68e289b7a1234567890abce1',
      eta: '2025-12-31T00:00:00.000Z',
      priority: 'High',
      status: 'Yet to Start'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Task created:', taskResponse.data.data._id);
    
    // 7. Get tasks
    console.log('7. Getting tasks...');
    const tasksResponse = await axios.get(`${BASE_URL}/brands/${brandId}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Tasks retrieved:', tasksResponse.data.data.tasks.length);
    
    console.log('\n🎉 All tests passed! System is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSimpleFlow();
