const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
let authToken = '';
let brandId = '';
let projectId = '';
let taskId = '';

// Helper function to make API calls
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function testServerHealth() {
  console.log('\n🔍 Testing Server Health...');
  const result = await makeRequest('GET', '/auth/health');
  if (result.success) {
    console.log('✅ Server is running');
    return true;
  } else {
    console.log('❌ Server is not responding');
    return false;
  }
}

async function testAdminRegistration() {
  console.log('\n🔍 Testing Admin Registration...');
  const adminData = {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    department: 'Data Analytics',
    role: 'admin'
  };
  
  const result = await makeRequest('POST', '/auth/register', adminData);
  if (result.success) {
    console.log('✅ Admin registered successfully');
    return true;
  } else {
    console.log('❌ Admin registration failed:', result.error);
    return false;
  }
}

async function testAdminLogin() {
  console.log('\n🔍 Testing Admin Login...');
  const loginData = {
    email: 'admin@test.com',
    password: 'password123'
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
}

async function testBrandCreation() {
  console.log('\n🔍 Testing Brand Creation...');
  const brandData = {
    name: 'Test Brand',
    description: 'Test Brand Description',
    industry: 'Technology',
    website: 'https://testbrand.com',
    settings: {
      allowUserRegistration: true,
      requireEmailVerification: false
    }
  };
  
  const result = await makeRequest('POST', '/brands', brandData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success && result.data.data) {
    brandId = result.data.data._id;
    console.log('✅ Brand created successfully');
    console.log(`   Brand ID: ${brandId}`);
    return true;
  } else {
    console.log('❌ Brand creation failed:', result.error);
    return false;
  }
}

async function testProjectCreation() {
  console.log('\n🔍 Testing Project Creation...');
  const projectData = {
    title: 'Test Project',
    description: 'Test Project Description',
    department: 'Data Analytics',
    priority: 'Medium',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const result = await makeRequest('POST', `/brands/${brandId}/projects`, projectData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success && result.data.data) {
    projectId = result.data.data._id;
    console.log('✅ Project created successfully');
    console.log(`   Project ID: ${projectId}`);
    return true;
  } else {
    console.log('❌ Project creation failed:', result.error);
    return false;
  }
}

async function testTaskCreation() {
  console.log('\n🔍 Testing Task Creation...');
  const taskData = {
    task: 'Test Task',
    description: 'Test Task Description',
    projectId: projectId,
    assignedTo: 'admin@test.com',
    reporter: 'admin@test.com',
    status: 'Yet to Start',
    priority: 'Medium',
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 8
  };
  
  const result = await makeRequest('POST', `/brands/${brandId}/tasks`, taskData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success && result.data.data) {
    taskId = result.data.data.id;
    console.log('✅ Task created successfully');
    console.log(`   Task ID: ${taskId}`);
    return true;
  } else {
    console.log('❌ Task creation failed:', result.error);
    return false;
  }
}

async function testTaskRetrieval() {
  console.log('\n🔍 Testing Task Retrieval...');
  const result = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}`, null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task retrieved successfully');
    return true;
  } else {
    console.log('❌ Task retrieval failed:', result.error);
    return false;
  }
}

async function testTaskUpdate() {
  console.log('\n🔍 Testing Task Update...');
  const updateData = {
    task: 'Updated Test Task',
    description: 'Updated Test Task Description',
    status: 'In Progress'
  };
  
  const result = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}`, updateData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task updated successfully');
    return true;
  } else {
    console.log('❌ Task update failed:', result.error);
    return false;
  }
}

async function testTaskAnalytics() {
  console.log('\n🔍 Testing Task Analytics...');
  const result = await makeRequest('GET', `/brands/${brandId}/tasks/analytics`, null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task analytics retrieved successfully');
    return true;
  } else {
    console.log('❌ Task analytics failed:', result.error);
    return false;
  }
}

async function testTaskSearch() {
  console.log('\n🔍 Testing Task Search...');
  const result = await makeRequest('GET', `/brands/${brandId}/tasks/search?q=test`, null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task search successful');
    return true;
  } else {
    console.log('❌ Task search failed:', result.error);
    return false;
  }
}

async function testTaskFilter() {
  console.log('\n🔍 Testing Task Filter...');
  const result = await makeRequest('GET', `/brands/${brandId}/tasks/filter?status=In Progress`, null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task filter successful');
    return true;
  } else {
    console.log('❌ Task filter failed:', result.error);
    return false;
  }
}

async function testTaskStatusUpdate() {
  console.log('\n🔍 Testing Task Status Update...');
  const statusData = {
    status: 'Completed'
  };
  
  const result = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/status`, statusData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task status updated successfully');
    return true;
  } else {
    console.log('❌ Task status update failed:', result.error);
    return false;
  }
}

async function testTaskPriorityUpdate() {
  console.log('\n🔍 Testing Task Priority Update...');
  const priorityData = {
    priority: 'High'
  };
  
  const result = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/priority`, priorityData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task priority updated successfully');
    return true;
  } else {
    console.log('❌ Task priority update failed:', result.error);
    return false;
  }
}

async function testTaskDeletion() {
  console.log('\n🔍 Testing Task Deletion...');
  const result = await makeRequest('DELETE', `/brands/${brandId}/tasks/${taskId}`, null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    console.log('✅ Task deleted successfully');
    return true;
  } else {
    console.log('❌ Task deletion failed:', result.error);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing...');
  console.log('=====================================');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Registration', fn: testAdminRegistration },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Brand Creation', fn: testBrandCreation },
    { name: 'Project Creation', fn: testProjectCreation },
    { name: 'Task Creation', fn: testTaskCreation },
    { name: 'Task Retrieval', fn: testTaskRetrieval },
    { name: 'Task Update', fn: testTaskUpdate },
    { name: 'Task Analytics', fn: testTaskAnalytics },
    { name: 'Task Search', fn: testTaskSearch },
    { name: 'Task Filter', fn: testTaskFilter },
    { name: 'Task Status Update', fn: testTaskStatusUpdate },
    { name: 'Task Priority Update', fn: testTaskPriorityUpdate },
    { name: 'Task Deletion', fn: testTaskDeletion }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The APIs are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error);

