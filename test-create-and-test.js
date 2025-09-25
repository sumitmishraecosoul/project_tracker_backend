const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
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

let authToken = '';
let brandId = '';
let projectId = '';

async function setupAuthentication() {
  log('\n🔐 Setting up Authentication...', 'cyan');
  
  // Try to login first
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'admin@test.com',
    password: 'password123'
  });
  
  if (loginResult.success) {
    authToken = loginResult.data.token;
    log('✅ Admin login successful', 'green');
    return true;
  }
  
  log('❌ Authentication failed', 'red');
  console.log('Login error:', loginResult.error);
  return false;
}

async function createBrand() {
  log('\n🏢 Creating Brand...', 'cyan');
  
  const brandResult = await makeRequest('POST', '/brands', {
    name: `Test Brand ${Date.now()}`,
    description: 'Test brand for API testing',
    website: 'https://testbrand.com',
    industry: 'Technology',
    size: 'Medium',
    settings: {
      allowUserRegistration: true,
      requireEmailVerification: false
    }
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (brandResult.success) {
    brandId = brandResult.data.brand._id;
    log('✅ Brand created successfully', 'green');
    log(`Brand ID: ${brandId}`, 'blue');
    return true;
  }
  
  log('❌ Brand creation failed', 'red');
  console.log('Brand error:', brandResult.error);
  return false;
}

async function createProject() {
  log('\n📁 Creating Project...', 'cyan');
  
  const projectResult = await makeRequest('POST', `/brands/${brandId}/projects`, {
    title: 'Test Project',
    description: 'Test project for API testing',
    status: 'Active',
    priority: 'High',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    department: 'Data Analytics',
    budget: 50000,
    teamMembers: []
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (projectResult.success) {
    projectId = projectResult.data.project._id;
    log('✅ Project created successfully', 'green');
    log(`Project ID: ${projectId}`, 'blue');
    return true;
  }
  
  log('❌ Project creation failed', 'red');
  console.log('Project error:', projectResult.error);
  return false;
}

async function testTaskAPIs() {
  log('\n📋 Testing Task APIs...', 'cyan');
  
  const tests = [
    {
      name: 'Get Brand Tasks',
      method: 'GET',
      url: `/brands/${brandId}/tasks`,
      expectedStatus: 200
    },
    {
      name: 'Get Brand Subtasks',
      method: 'GET',
      url: `/brands/${brandId}/subtasks`,
      expectedStatus: 200
    },
    {
      name: 'Get Task Analytics',
      method: 'GET',
      url: `/brands/${brandId}/tasks/analytics`,
      expectedStatus: 200
    },
    {
      name: 'Search Tasks',
      method: 'GET',
      url: `/brands/${brandId}/tasks/search?q=test`,
      expectedStatus: 200
    },
    {
      name: 'Filter Tasks',
      method: 'GET',
      url: `/brands/${brandId}/tasks/filter?status=Yet to Start`,
      expectedStatus: 200
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await makeRequest(test.method, test.url, null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (result.success) {
      log(`✅ ${test.name} - PASSED`, 'green');
      passed++;
    } else {
      log(`❌ ${test.name} - FAILED (${result.status})`, 'red');
      console.log('Error:', result.error);
    }
  }
  
  log(`\n📊 Task APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testTaskCreation() {
  log('\n➕ Testing Task Creation...', 'cyan');
  
  const taskData = {
    projectId: projectId,
    task: 'Test Task',
    description: 'Test task description',
    taskType: 'Daily',
    priority: 'High',
    status: 'Yet to Start', // Use valid enum value
    assignedTo: 'admin@test.com',
    reporter: 'admin@test.com',
    startDate: new Date().toISOString(),
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 8,
    labels: ['test', 'api'],
    attachments: []
  };
  
  const result = await makeRequest('POST', `/brands/${brandId}/tasks`, taskData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    log('✅ Task created successfully', 'green');
    log(`Task ID: ${result.data.task._id}`, 'blue');
    return true;
  } else {
    log('❌ Task creation failed', 'red');
    console.log('Error:', result.error);
    return false;
  }
}

async function testSubtaskCreation() {
  log('\n📝 Testing Subtask Creation...', 'cyan');
  
  // First get a task to create subtask for
  const tasksResult = await makeRequest('GET', `/brands/${brandId}/tasks`, null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (!tasksResult.success || !tasksResult.data.tasks || tasksResult.data.tasks.length === 0) {
    log('❌ No tasks found for subtask creation', 'red');
    return false;
  }
  
  const taskId = tasksResult.data.tasks[0]._id;
  
  const subtaskData = {
    taskId: taskId,
    title: 'Test Subtask',
    description: 'Test subtask description',
    priority: 'High',
    status: 'Yet to Start',
    assignedTo: 'admin@test.com',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 4,
    labels: ['test', 'subtask']
  };
  
  const result = await makeRequest('POST', `/brands/${brandId}/subtasks`, subtaskData, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success) {
    log('✅ Subtask created successfully', 'green');
    log(`Subtask ID: ${result.data.subtask._id}`, 'blue');
    return true;
  } else {
    log('❌ Subtask creation failed', 'red');
    console.log('Error:', result.error);
    return false;
  }
}

async function runComprehensiveTest() {
  log('🚀 Starting Comprehensive Task & Subtask API Testing...', 'bright');
  
  try {
    // Setup phase
    const authSuccess = await setupAuthentication();
    if (!authSuccess) return;
    
    const brandSuccess = await createBrand();
    if (!brandSuccess) return;
    
    const projectSuccess = await createProject();
    if (!projectSuccess) return;
    
    // Test phases
    const taskAPIsSuccess = await testTaskAPIs();
    const taskCreationSuccess = await testTaskCreation();
    const subtaskCreationSuccess = await testSubtaskCreation();
    
    // Final summary
    log('\n📊 COMPREHENSIVE TEST SUMMARY:', 'cyan');
    log('================================', 'cyan');
    
    const results = [
      { name: 'Task APIs', success: taskAPIsSuccess },
      { name: 'Task Creation', success: taskCreationSuccess },
      { name: 'Subtask Creation', success: subtaskCreationSuccess }
    ];
    
    let totalPassed = 0;
    results.forEach(result => {
      if (result.success) {
        log(`✅ ${result.name}: PASSED`, 'green');
        totalPassed++;
      } else {
        log(`❌ ${result.name}: FAILED`, 'red');
      }
    });
    
    log(`\n🎯 OVERALL RESULT: ${totalPassed}/${results.length} test suites passed`, 
        totalPassed === results.length ? 'green' : 'yellow');
    
    if (totalPassed === results.length) {
      log('\n🎉 ALL TASK AND SUBTASK APIs ARE WORKING PERFECTLY!', 'green');
    } else {
      log('\n⚠️ Some APIs need attention. Check the failed tests above.', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Test failed with error: ${error.message}`, 'red');
  }
}

// Run the comprehensive test
runComprehensiveTest();
