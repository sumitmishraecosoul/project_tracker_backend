const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let brandId = '';
let projectId = '';
let categoryId = '';
let taskId = '';
let subtaskId = '';
let commentId = '';

// Test data
const testData = {
  user: {
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPassword123!',
    role: 'admin',
    employeeNumber: `EMP${Date.now()}`
  },
  brand: {
    name: `Test Brand ${Date.now()}`,
    description: 'Test brand description'
  },
  project: {
    title: `Test Project ${Date.now()}`,
    description: 'Test project description',
    department: 'Engineering'
  },
  category: {
    name: 'Test Category',
    color: '#FF6B6B',
    description: 'Test category description'
  },
  task: {
    task: 'Test Task',
    description: 'Test task description',
    priority: 'High',
    status: 'Yet to Start',
    eta: '2025-12-31T00:00:00.000Z',
    estimatedHours: 8
  },
  subtask: {
    task: 'Test Subtask',
    description: 'Test subtask description',
    priority: 'Medium',
    status: 'To Do',
    eta: '2025-12-30T00:00:00.000Z',
    estimatedHours: 4
  },
  comment: {
    content: 'This is a test comment with **markdown** support'
  }
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...headers
      }
    };
    
    if (data && method !== 'GET') {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  const result = await apiCall('GET', '/health');
  if (result.success) {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', result.error);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n🔍 Testing User Registration...');
  const result = await apiCall('POST', '/auth/register', testData.user);
  if (result.success) {
    console.log('✅ User registration successful');
    return true;
  } else {
    console.log('❌ User registration failed:', result.error);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔍 Testing User Login...');
  const result = await apiCall('POST', '/auth/login', {
    email: testData.user.email,
    password: testData.user.password
  });
  if (result.success) {
    authToken = result.data.token;
    console.log('✅ User login successful');
    return true;
  } else {
    console.log('❌ User login failed:', result.error);
    return false;
  }
}

async function testBrandCreation() {
  console.log('\n🔍 Testing Brand Creation...');
  const result = await apiCall('POST', '/brands', testData.brand);
  if (result.success) {
    brandId = result.data._id;
    console.log('✅ Brand creation successful');
    return true;
  } else {
    console.log('❌ Brand creation failed:', result.error);
    return false;
  }
}

async function testProjectCreation() {
  console.log('\n🔍 Testing Project Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/projects`, testData.project);
  if (result.success) {
    projectId = result.data._id;
    console.log('✅ Project creation successful');
    return true;
  } else {
    console.log('❌ Project creation failed:', result.error);
    return false;
  }
}

async function testGetCategories() {
  console.log('\n🔍 Testing Get Categories...');
  const result = await apiCall('GET', `/brands/${brandId}/projects/${projectId}/categories`);
  if (result.success) {
    if (result.data.data && result.data.data.length > 0) {
      categoryId = result.data.data[0]._id;
      console.log('✅ Categories retrieved successfully');
      console.log(`   Found ${result.data.data.length} categories`);
      return true;
    } else {
      console.log('❌ No categories found (should have 5 default categories)');
      return false;
    }
  } else {
    console.log('❌ Get categories failed:', result.error);
    return false;
  }
}

async function testCreateCustomCategory() {
  console.log('\n🔍 Testing Create Custom Category...');
  const result = await apiCall('POST', `/brands/${brandId}/projects/${projectId}/categories`, testData.category);
  if (result.success) {
    console.log('✅ Custom category creation successful');
    return true;
  } else {
    console.log('❌ Custom category creation failed:', result.error);
    return false;
  }
}

async function testTaskCreation() {
  console.log('\n🔍 Testing Task Creation...');
  const taskData = {
    ...testData.task,
    projectId: projectId,
    category_id: categoryId,
    assignedTo: '68e289b7a1234567890abce1', // Use a valid ObjectId
    reporter: '68e289b7a1234567890abce1'    // Use a valid ObjectId
  };
  
  const result = await apiCall('POST', `/brands/${brandId}/tasks`, taskData);
  if (result.success) {
    taskId = result.data._id;
    console.log('✅ Task creation successful');
    return true;
  } else {
    console.log('❌ Task creation failed:', result.error);
    return false;
  }
}

async function testGetTasks() {
  console.log('\n🔍 Testing Get Tasks...');
  const result = await apiCall('GET', `/brands/${brandId}/tasks`);
  if (result.success) {
    console.log('✅ Tasks retrieved successfully');
    console.log(`   Found ${result.data.data.tasks.length} tasks`);
    return true;
  } else {
    console.log('❌ Get tasks failed:', result.error);
    return false;
  }
}

async function testUpdateTaskStatus() {
  console.log('\n🔍 Testing Update Task Status...');
  const result = await apiCall('PUT', `/brands/${brandId}/tasks/${taskId}/status`, { status: 'In Progress' });
  if (result.success) {
    console.log('✅ Task status update successful');
    return true;
  } else {
    console.log('❌ Task status update failed:', result.error);
    return false;
  }
}

async function testSubtaskCreation() {
  console.log('\n🔍 Testing Subtask Creation...');
  const subtaskData = {
    ...testData.subtask,
    taskId: taskId,
    assignedTo: '68e289b7a1234567890abce1', // Use a valid ObjectId
    reporter: '68e289b7a1234567890abce1'    // Use a valid ObjectId
  };
  
  const result = await apiCall('POST', `/brands/${brandId}/subtasks`, subtaskData);
  if (result.success) {
    subtaskId = result.data._id;
    console.log('✅ Subtask creation successful');
    return true;
  } else {
    console.log('❌ Subtask creation failed:', result.error);
    return false;
  }
}

async function testGetSubtasks() {
  console.log('\n🔍 Testing Get Subtasks...');
  const result = await apiCall('GET', `/brands/${brandId}/subtasks`);
  if (result.success) {
    console.log('✅ Subtasks retrieved successfully');
    console.log(`   Found ${result.data.data.subtasks.length} subtasks`);
    return true;
  } else {
    console.log('❌ Get subtasks failed:', result.error);
    return false;
  }
}

async function testCommentCreation() {
  console.log('\n🔍 Testing Comment Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/tasks/${taskId}/comments`, testData.comment);
  if (result.success) {
    commentId = result.data._id;
    console.log('✅ Comment creation successful');
    return true;
  } else {
    console.log('❌ Comment creation failed:', result.error);
    return false;
  }
}

async function testGetComments() {
  console.log('\n🔍 Testing Get Comments...');
  const result = await apiCall('GET', `/brands/${brandId}/tasks/${taskId}/comments`);
  if (result.success) {
    console.log('✅ Comments retrieved successfully');
    console.log(`   Found ${result.data.data.length} comments`);
    return true;
  } else {
    console.log('❌ Get comments failed:', result.error);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🔍 Testing Error Handling...');
  
  // Test invalid JSON
  try {
    await axios.post(`${BASE_URL}/brands/${brandId}/tasks`, 'invalid json', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
    });
  } catch (error) {
    if (error.response?.data?.error?.code === 'INVALID_JSON') {
      console.log('✅ JSON error handling works');
    } else {
      console.log('❌ JSON error handling failed');
    }
  }
  
  // Test invalid ObjectId
  const result = await apiCall('GET', `/brands/invalid-id/projects/invalid-id/categories`);
  if (!result.success && result.error.error.code === 'INVALID_BRAND_ID') {
    console.log('✅ ObjectId validation works');
    return true;
  } else {
    console.log('❌ ObjectId validation failed');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete System Verification...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Brand Creation', fn: testBrandCreation },
    { name: 'Project Creation', fn: testProjectCreation },
    { name: 'Get Categories', fn: testGetCategories },
    { name: 'Create Custom Category', fn: testCreateCustomCategory },
    { name: 'Task Creation', fn: testTaskCreation },
    { name: 'Get Tasks', fn: testGetTasks },
    { name: 'Update Task Status', fn: testUpdateTaskStatus },
    { name: 'Subtask Creation', fn: testSubtaskCreation },
    { name: 'Get Subtasks', fn: testGetSubtasks },
    { name: 'Comment Creation', fn: testCommentCreation },
    { name: 'Get Comments', fn: testGetComments },
    { name: 'Error Handling', fn: testErrorHandling }
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
  
  console.log('\n📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
