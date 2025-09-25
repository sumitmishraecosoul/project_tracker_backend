const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const timestamp = Date.now();
const testUser = {
  name: 'Task ID Debug Tester',
  email: `taskiddebug${timestamp}@example.com`,
  password: 'TestPassword123!',
  employeeNumber: `EMP-TASKID-${timestamp}`,
  department: 'Data Analytics',
  username: `taskiddebug${timestamp}`
};

const testBrand = {
  name: `Task ID Debug Brand ${timestamp}`,
  description: 'Brand for task ID debugging',
  website: 'https://taskiddebug.com',
  industry: 'Technology'
};

const debugTaskId = async () => {
  console.log('🔍 DEBUGGING TASK ID GENERATION');
  console.log('='.repeat(50));
  
  try {
    // 1. Register user
    console.log('1. Registering user...');
    await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered');
    
    // 2. Login user
    console.log('2. Logging in user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    let authToken = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ User logged in');
    
    // 3. Create brand
    console.log('3. Creating brand...');
    const brandResponse = await axios.post(`${BASE_URL}/brands`, testBrand, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const brandId = brandResponse.data.data.id;
    console.log('✅ Brand created:', brandId);
    
    // 4. Switch to brand
    console.log('4. Switching to brand...');
    const switchResponse = await axios.post(`${BASE_URL}/brands/${brandId}/switch`, {}, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    authToken = switchResponse.data.token;
    console.log('✅ Brand switched');
    
    // 5. Create project
    console.log('5. Creating project...');
    const projectResponse = await axios.post(`${BASE_URL}/brands/${brandId}/projects`, {
      title: 'Task ID Debug Project',
      description: 'Project for task ID debugging',
      status: 'Active',
      priority: 'Medium',
      department: 'Data Analytics',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const projectId = projectResponse.data.data._id;
    console.log('✅ Project created:', projectId);
    
    // 6. Create task with custom ID
    console.log('6. Creating task with custom ID...');
    const customTaskId = `TASK-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Custom task ID:', customTaskId);
    
    try {
      const taskResponse = await axios.post(`${BASE_URL}/brands/${brandId}/tasks`, {
        task: 'Task ID Debug Task',
        description: 'Task for task ID debugging',
        status: 'Yet to Start',
        priority: 'Medium',
        projectId: projectId,
        assignedTo: userId,
        reporter: userId,
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id: customTaskId
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('✅ Task created successfully with ID:', taskResponse.data.data.id);
    } catch (error) {
      console.log('❌ Task creation failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

debugTaskId().catch(console.error);

