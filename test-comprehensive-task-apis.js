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
let taskId = '';
let subtaskId = '';

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
  
  // If login fails, try to register
  log('Login failed, trying to register admin...', 'yellow');
  const registerResult = await makeRequest('POST', '/auth/register', {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    department: 'Data Analytics',
    employeeNumber: 'EMP001'
  });
  
  if (registerResult.success) {
    authToken = registerResult.data.token;
    log('✅ Admin registration successful', 'green');
    return true;
  }
  
  log('❌ Authentication failed', 'red');
  console.log('Register error:', registerResult.error);
  return false;
}

async function setupBrand() {
  log('\n🏢 Setting up Brand...', 'cyan');
  
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
    return true;
  }
  
  log('❌ Brand creation failed', 'red');
  console.log('Brand error:', brandResult.error);
  return false;
}

async function setupProject() {
  log('\n📁 Setting up Project...', 'cyan');
  
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
    return true;
  }
  
  log('❌ Project creation failed', 'red');
  console.log('Project error:', projectResult.error);
  return false;
}

async function testBasicTaskAPIs() {
  log('\n📋 Testing Basic Task APIs...', 'cyan');
  
  const tests = [
    {
      name: 'Get All Tasks',
      method: 'GET',
      url: '/tasks',
      expectedStatus: 200
    },
    {
      name: 'Get All User Tasks',
      method: 'GET',
      url: '/user-tasks',
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
  
  log(`\n📊 Basic Task APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testBrandTaskAPIs() {
  log('\n🏢 Testing Brand Task APIs...', 'cyan');
  
  const tests = [
    {
      name: 'Get Brand Tasks',
      method: 'GET',
      url: `/brands/${brandId}/tasks`,
      expectedStatus: 200
    },
    {
      name: 'Get Brand Project Tasks',
      method: 'GET',
      url: `/brands/${brandId}/projects/${projectId}/tasks`,
      expectedStatus: 200
    },
    {
      name: 'Get Task Sections',
      method: 'GET',
      url: `/brands/${brandId}/projects/${projectId}/sections`,
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
  
  log(`\n📊 Brand Task APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testCreateTask() {
  log('\n➕ Testing Task Creation...', 'cyan');
  
  const taskData = {
    projectId: projectId,
    task: 'Test Task',
    description: 'Test task description',
    taskType: 'Daily',
    priority: 'High',
    status: 'Yet to Start',
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
    taskId = result.data.task._id;
    log('✅ Task created successfully', 'green');
    log(`Task ID: ${taskId}`, 'blue');
    return true;
  } else {
    log('❌ Task creation failed', 'red');
    console.log('Error:', result.error);
    return false;
  }
}

async function testTaskOperations() {
  log('\n🔧 Testing Task Operations...', 'cyan');
  
  if (!taskId) {
    log('❌ No task ID available for testing', 'red');
    return false;
  }
  
  const tests = [
    {
      name: 'Get Task by ID',
      method: 'GET',
      url: `/brands/${brandId}/tasks/${taskId}`,
      expectedStatus: 200
    },
    {
      name: 'Update Task',
      method: 'PUT',
      url: `/brands/${brandId}/tasks/${taskId}`,
      data: {
        task: 'Updated Test Task',
        description: 'Updated description',
        priority: 'Critical'
      },
      expectedStatus: 200
    },
    {
      name: 'Assign Task',
      method: 'POST',
      url: `/brands/${brandId}/tasks/${taskId}/assign`,
      data: {
        assignedTo: 'admin@test.com'
      },
      expectedStatus: 200
    },
    {
      name: 'Update Task Status',
      method: 'PUT',
      url: `/brands/${brandId}/tasks/${taskId}/status`,
      data: {
        status: 'In Progress'
      },
      expectedStatus: 200
    },
    {
      name: 'Update Task Priority',
      method: 'PUT',
      url: `/brands/${brandId}/tasks/${taskId}/priority`,
      data: {
        priority: 'Critical'
      },
      expectedStatus: 200
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await makeRequest(test.method, test.url, test.data, {
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
  
  log(`\n📊 Task Operations: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testSubtaskAPIs() {
  log('\n📝 Testing Subtask APIs...', 'cyan');
  
  const tests = [
    {
      name: 'Get Brand Subtasks',
      method: 'GET',
      url: `/brands/${brandId}/subtasks`,
      expectedStatus: 200
    },
    {
      name: 'Get Task Subtasks',
      method: 'GET',
      url: `/brands/${brandId}/tasks/${taskId}/subtasks`,
      expectedStatus: 200
    },
    {
      name: 'Get Subtask Analytics',
      method: 'GET',
      url: `/brands/${brandId}/subtasks/analytics`,
      expectedStatus: 200
    },
    {
      name: 'Search Subtasks',
      method: 'GET',
      url: `/brands/${brandId}/subtasks/search?q=test`,
      expectedStatus: 200
    },
    {
      name: 'Filter Subtasks',
      method: 'GET',
      url: `/brands/${brandId}/subtasks/filter?status=Yet to Start`,
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
  
  log(`\n📊 Subtask APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testCreateSubtask() {
  log('\n➕ Testing Subtask Creation...', 'cyan');
  
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
    subtaskId = result.data.subtask._id;
    log('✅ Subtask created successfully', 'green');
    log(`Subtask ID: ${subtaskId}`, 'blue');
    return true;
  } else {
    log('❌ Subtask creation failed', 'red');
    console.log('Error:', result.error);
    return false;
  }
}

async function testSubtaskOperations() {
  log('\n🔧 Testing Subtask Operations...', 'cyan');
  
  if (!subtaskId) {
    log('❌ No subtask ID available for testing', 'red');
    return false;
  }
  
  const tests = [
    {
      name: 'Get Subtask by ID',
      method: 'GET',
      url: `/brands/${brandId}/subtasks/${subtaskId}`,
      expectedStatus: 200
    },
    {
      name: 'Update Subtask',
      method: 'PUT',
      url: `/brands/${brandId}/subtasks/${subtaskId}`,
      data: {
        title: 'Updated Test Subtask',
        description: 'Updated subtask description',
        priority: 'Critical'
      },
      expectedStatus: 200
    },
    {
      name: 'Assign Subtask',
      method: 'POST',
      url: `/brands/${brandId}/subtasks/${subtaskId}/assign`,
      data: {
        assignedTo: 'admin@test.com'
      },
      expectedStatus: 200
    },
    {
      name: 'Update Subtask Status',
      method: 'PUT',
      url: `/brands/${brandId}/subtasks/${subtaskId}/status`,
      data: {
        status: 'In Progress'
      },
      expectedStatus: 200
    },
    {
      name: 'Update Subtask Priority',
      method: 'PUT',
      url: `/brands/${brandId}/subtasks/${subtaskId}/priority`,
      data: {
        priority: 'Critical'
      },
      expectedStatus: 200
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await makeRequest(test.method, test.url, test.data, {
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
  
  log(`\n📊 Subtask Operations: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testUserTaskAPIs() {
  log('\n👤 Testing User Task APIs...', 'cyan');
  
  const tests = [
    {
      name: 'Get All User Tasks',
      method: 'GET',
      url: '/user-tasks',
      expectedStatus: 200
    },
    {
      name: 'Get User Tasks by User ID',
      method: 'GET',
      url: '/user-tasks/user/admin@test.com',
      expectedStatus: 200
    },
    {
      name: 'Get User Task Summary',
      method: 'GET',
      url: '/user-tasks/user/admin@test.com/summary',
      expectedStatus: 200
    },
    {
      name: 'Get User Tasks by Date',
      method: 'GET',
      url: `/user-tasks/date/${new Date().toISOString().split('T')[0]}`,
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
  
  log(`\n📊 User Task APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function runComprehensiveTest() {
  log('🚀 Starting Comprehensive Task & Subtask API Testing...', 'bright');
  
  try {
    // Setup phase
    const authSuccess = await setupAuthentication();
    if (!authSuccess) return;
    
    const brandSuccess = await setupBrand();
    if (!brandSuccess) return;
    
    const projectSuccess = await setupProject();
    if (!projectSuccess) return;
    
    // Test phases
    const basicTaskSuccess = await testBasicTaskAPIs();
    const brandTaskSuccess = await testBrandTaskAPIs();
    const taskCreationSuccess = await testCreateTask();
    const taskOpsSuccess = await testTaskOperations();
    const subtaskAPIsSuccess = await testSubtaskAPIs();
    const subtaskCreationSuccess = await testCreateSubtask();
    const subtaskOpsSuccess = await testSubtaskOperations();
    const userTaskSuccess = await testUserTaskAPIs();
    
    // Final summary
    log('\n📊 COMPREHENSIVE TEST SUMMARY:', 'cyan');
    log('================================', 'cyan');
    
    const results = [
      { name: 'Basic Task APIs', success: basicTaskSuccess },
      { name: 'Brand Task APIs', success: brandTaskSuccess },
      { name: 'Task Creation', success: taskCreationSuccess },
      { name: 'Task Operations', success: taskOpsSuccess },
      { name: 'Subtask APIs', success: subtaskAPIsSuccess },
      { name: 'Subtask Creation', success: subtaskCreationSuccess },
      { name: 'Subtask Operations', success: subtaskOpsSuccess },
      { name: 'User Task APIs', success: userTaskSuccess }
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
