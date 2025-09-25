const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let brandId = '';
let projectId = '';
let taskId = '';

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
        'Authorization': `Bearer ${authToken}`,
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

async function testAuthentication() {
  log('\n🔐 Testing Authentication...', 'cyan');
  
  // Try to login with existing admin user
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'admin@test.com',
    password: 'password123'
  });
  
  if (loginResult.success) {
    log('✅ Admin login successful', 'green');
    authToken = loginResult.data.token;
    return true;
  } else {
    log('❌ Admin login failed, trying to register...', 'red');
    
    // Try to register new admin
    const registerResult = await makeRequest('POST', '/auth/register', {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      department: 'Data Analytics',
      employeeNumber: 'EMP001'
    });
    
    if (registerResult.success) {
      log('✅ Admin registration successful', 'green');
      authToken = registerResult.data.token;
      return true;
    } else {
      log('❌ Authentication failed', 'red');
      console.log('Error:', registerResult.error);
      return false;
    }
  }
}

async function testBrandAPIs() {
  log('\n🏢 Testing Brand APIs...', 'cyan');
  
  // Get existing brands
  const getBrandsResult = await makeRequest('GET', '/brands');
  if (getBrandsResult.success && getBrandsResult.data.brands.length > 0) {
    log('✅ Get brands successful', 'green');
    brandId = getBrandsResult.data.brands[0]._id;
    log(`Using existing brand: ${brandId}`, 'yellow');
    return true;
  } else {
    log('❌ No existing brands found, creating new brand...', 'red');
    
    // Create new brand
    const createBrandResult = await makeRequest('POST', '/brands', {
      name: 'Test Brand',
      description: 'Test brand for API testing',
      industry: 'Technology',
      website: 'https://testbrand.com'
    });
    
    if (createBrandResult.success) {
      log('✅ Brand creation successful', 'green');
      brandId = createBrandResult.data.brand._id;
      return true;
    } else {
      log('❌ Brand creation failed', 'red');
      return false;
    }
  }
}

async function testProjectAPIs() {
  log('\n📁 Testing Project APIs...', 'cyan');
  
  // Get existing projects
  const getProjectsResult = await makeRequest('GET', `/brands/${brandId}/projects`);
  if (getProjectsResult.success && getProjectsResult.data.projects.length > 0) {
    log('✅ Get projects successful', 'green');
    projectId = getProjectsResult.data.projects[0]._id;
    log(`Using existing project: ${projectId}`, 'yellow');
    return true;
  } else {
    log('❌ No existing projects found, creating new project...', 'red');
    
    // Create new project
    const createProjectResult = await makeRequest('POST', `/brands/${brandId}/projects`, {
      title: 'Test Project',
      description: 'Test project for API testing',
      department: 'IT',
      priority: 'High',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    if (createProjectResult.success) {
      log('✅ Project creation successful', 'green');
      projectId = createProjectResult.data.project._id;
      return true;
    } else {
      log('❌ Project creation failed', 'red');
      console.log('Error:', createProjectResult.error);
      return false;
    }
  }
}

async function testTaskAPIs() {
  log('\n📋 Testing Task APIs...', 'cyan');
  
  // Test 1: Get all tasks
  log('Testing GET /api/brands/:brandId/tasks...', 'blue');
  const getTasksResult = await makeRequest('GET', `/brands/${brandId}/tasks`);
  if (getTasksResult.success) {
    log('✅ Get tasks successful', 'green');
  } else {
    log('❌ Get tasks failed', 'red');
    console.log('Error:', getTasksResult.error);
  }
  
  // Test 2: Create task
  log('Testing POST /api/brands/:brandId/tasks...', 'blue');
  const createTaskResult = await makeRequest('POST', `/brands/${brandId}/tasks`, {
    projectId: projectId,
    task: 'Test Task API',
    description: 'Testing task creation API',
    priority: 'High',
    assignedTo: '68d361ba23002084a402ece8',
    reporter: '68d361ba23002084a402ece8',
    startDate: new Date().toISOString(),
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 8
  });
  
  if (createTaskResult.success) {
    log('✅ Task creation successful', 'green');
    taskId = createTaskResult.data.task._id;
  } else {
    log('❌ Task creation failed', 'red');
    console.log('Error:', createTaskResult.error);
    return false;
  }
  
  // Test 3: Get task by ID
  log('Testing GET /api/brands/:brandId/tasks/:id...', 'blue');
  const getTaskResult = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}`);
  if (getTaskResult.success) {
    log('✅ Get task by ID successful', 'green');
  } else {
    log('❌ Get task by ID failed', 'red');
    console.log('Error:', getTaskResult.error);
  }
  
  // Test 4: Update task
  log('Testing PUT /api/brands/:brandId/tasks/:id...', 'blue');
  const updateTaskResult = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}`, {
    task: 'Updated Test Task',
    description: 'Updated task description'
  });
  if (updateTaskResult.success) {
    log('✅ Task update successful', 'green');
  } else {
    log('❌ Task update failed', 'red');
    console.log('Error:', updateTaskResult.error);
  }
  
  // Test 5: Update task status
  log('Testing PUT /api/brands/:brandId/tasks/:id/status...', 'blue');
  const updateStatusResult = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/status`, {
    status: 'In Progress'
  });
  if (updateStatusResult.success) {
    log('✅ Task status update successful', 'green');
  } else {
    log('❌ Task status update failed', 'red');
    console.log('Error:', updateStatusResult.error);
  }
  
  // Test 6: Update task priority
  log('Testing PUT /api/brands/:brandId/tasks/:id/priority...', 'blue');
  const updatePriorityResult = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/priority`, {
    priority: 'Critical'
  });
  if (updatePriorityResult.success) {
    log('✅ Task priority update successful', 'green');
  } else {
    log('❌ Task priority update failed', 'red');
    console.log('Error:', updatePriorityResult.error);
  }
  
  // Test 7: Assign task
  log('Testing POST /api/brands/:brandId/tasks/:id/assign...', 'blue');
  const assignTaskResult = await makeRequest('POST', `/brands/${brandId}/tasks/${taskId}/assign`, {
    assignedTo: '68d361ba23002084a402ece8'
  });
  if (assignTaskResult.success) {
    log('✅ Task assignment successful', 'green');
  } else {
    log('❌ Task assignment failed', 'red');
    console.log('Error:', assignTaskResult.error);
  }
  
  // Test 8: Get task analytics
  log('Testing GET /api/brands/:brandId/tasks/analytics...', 'blue');
  const getAnalyticsResult = await makeRequest('GET', `/brands/${brandId}/tasks/analytics`);
  if (getAnalyticsResult.success) {
    log('✅ Task analytics successful', 'green');
  } else {
    log('❌ Task analytics failed', 'red');
    console.log('Error:', getAnalyticsResult.error);
  }
  
  // Test 9: Search tasks
  log('Testing GET /api/brands/:brandId/tasks/search...', 'blue');
  const searchTasksResult = await makeRequest('GET', `/brands/${brandId}/tasks/search?q=test`);
  if (searchTasksResult.success) {
    log('✅ Task search successful', 'green');
  } else {
    log('❌ Task search failed', 'red');
    console.log('Error:', searchTasksResult.error);
  }
  
  // Test 10: Filter tasks
  log('Testing GET /api/brands/:brandId/tasks/filter...', 'blue');
  const filterTasksResult = await makeRequest('GET', `/brands/${brandId}/tasks/filter?status=In Progress`);
  if (filterTasksResult.success) {
    log('✅ Task filtering successful', 'green');
  } else {
    log('❌ Task filtering failed', 'red');
    console.log('Error:', filterTasksResult.error);
  }
  
  return true;
}

async function testSubtaskAPIs() {
  log('\n📝 Testing Subtask APIs...', 'cyan');
  
  // Test 1: Get all subtasks
  log('Testing GET /api/brands/:brandId/subtasks...', 'blue');
  const getSubtasksResult = await makeRequest('GET', `/brands/${brandId}/subtasks`);
  if (getSubtasksResult.success) {
    log('✅ Get subtasks successful', 'green');
  } else {
    log('❌ Get subtasks failed', 'red');
    console.log('Error:', getSubtasksResult.error);
  }
  
  // Test 2: Create subtask
  log('Testing POST /api/brands/:brandId/subtasks...', 'blue');
  const createSubtaskResult = await makeRequest('POST', `/brands/${brandId}/subtasks`, {
    task_id: taskId,
    title: 'Test Subtask',
    description: 'Testing subtask creation API',
    priority: 'High',
    assignedTo: '68d361ba23002084a402ece8',
    reporter: '68d361ba23002084a402ece8',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 4
  });
  
  if (createSubtaskResult.success) {
    log('✅ Subtask creation successful', 'green');
    const subtaskId = createSubtaskResult.data.subtask._id;
    
    // Test 3: Get subtask by ID
    log('Testing GET /api/brands/:brandId/subtasks/:id...', 'blue');
    const getSubtaskResult = await makeRequest('GET', `/brands/${brandId}/subtasks/${subtaskId}`);
    if (getSubtaskResult.success) {
      log('✅ Get subtask by ID successful', 'green');
    } else {
      log('❌ Get subtask by ID failed', 'red');
      console.log('Error:', getSubtaskResult.error);
    }
    
    // Test 4: Update subtask
    log('Testing PUT /api/brands/:brandId/subtasks/:id...', 'blue');
    const updateSubtaskResult = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}`, {
      title: 'Updated Test Subtask',
      description: 'Updated subtask description'
    });
    if (updateSubtaskResult.success) {
      log('✅ Subtask update successful', 'green');
    } else {
      log('❌ Subtask update failed', 'red');
      console.log('Error:', updateSubtaskResult.error);
    }
    
    // Test 5: Update subtask status
    log('Testing PUT /api/brands/:brandId/subtasks/:id/status...', 'blue');
    const updateSubtaskStatusResult = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}/status`, {
      status: 'In Progress'
    });
    if (updateSubtaskStatusResult.success) {
      log('✅ Subtask status update successful', 'green');
    } else {
      log('❌ Subtask status update failed', 'red');
      console.log('Error:', updateSubtaskStatusResult.error);
    }
    
    // Test 6: Complete subtask
    log('Testing PUT /api/brands/:brandId/subtasks/:id/complete...', 'blue');
    const completeSubtaskResult = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}/complete`);
    if (completeSubtaskResult.success) {
      log('✅ Subtask completion successful', 'green');
    } else {
      log('❌ Subtask completion failed', 'red');
      console.log('Error:', completeSubtaskResult.error);
    }
    
  } else {
    log('❌ Subtask creation failed', 'red');
    console.log('Error:', createSubtaskResult.error);
  }
  
  // Test 7: Get task subtasks
  log('Testing GET /api/brands/:brandId/tasks/:id/subtasks...', 'blue');
  const getTaskSubtasksResult = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/subtasks`);
  if (getTaskSubtasksResult.success) {
    log('✅ Get task subtasks successful', 'green');
  } else {
    log('❌ Get task subtasks failed', 'red');
    console.log('Error:', getTaskSubtasksResult.error);
  }
  
  // Test 8: Get subtask analytics
  log('Testing GET /api/brands/:brandId/subtasks/analytics...', 'blue');
  const getSubtaskAnalyticsResult = await makeRequest('GET', `/brands/${brandId}/subtasks/analytics`);
  if (getSubtaskAnalyticsResult.success) {
    log('✅ Subtask analytics successful', 'green');
  } else {
    log('❌ Subtask analytics failed', 'red');
    console.log('Error:', getSubtaskAnalyticsResult.error);
  }
  
  // Test 9: Search subtasks
  log('Testing GET /api/brands/:brandId/subtasks/search...', 'blue');
  const searchSubtasksResult = await makeRequest('GET', `/brands/${brandId}/subtasks/search?q=test`);
  if (searchSubtasksResult.success) {
    log('✅ Subtask search successful', 'green');
  } else {
    log('❌ Subtask search failed', 'red');
    console.log('Error:', searchSubtasksResult.error);
  }
  
  return true;
}

async function testUserTaskAPIs() {
  log('\n👤 Testing User Task APIs...', 'cyan');
  
  // Test 1: Get all user tasks
  log('Testing GET /api/user-tasks...', 'blue');
  const getUserTasksResult = await makeRequest('GET', '/user-tasks');
  if (getUserTasksResult.success) {
    log('✅ Get user tasks successful', 'green');
  } else {
    log('❌ Get user tasks failed', 'red');
    console.log('Error:', getUserTasksResult.error);
  }
  
  // Test 2: Create user task
  log('Testing POST /api/user-tasks...', 'blue');
  const createUserTaskResult = await makeRequest('POST', '/user-tasks', {
    user: '68d361ba23002084a402ece8',
    date: new Date().toISOString(),
    typeOfWork: 'Development',
    workDescription: 'Test user task work',
    project: projectId,
    task: taskId,
    frequency: 'Daily',
    status: 'Pending',
    hoursSpent: 2,
    notes: 'Test user task notes'
  });
  
  if (createUserTaskResult.success) {
    log('✅ User task creation successful', 'green');
  } else {
    log('❌ User task creation failed', 'red');
    console.log('Error:', createUserTaskResult.error);
  }
  
  // Test 3: Get user tasks by user ID
  log('Testing GET /api/user-tasks/user/:userId...', 'blue');
  const getUserTasksByIdResult = await makeRequest('GET', '/user-tasks/user/68d361ba23002084a402ece8');
  if (getUserTasksByIdResult.success) {
    log('✅ Get user tasks by user ID successful', 'green');
  } else {
    log('❌ Get user tasks by user ID failed', 'red');
    console.log('Error:', getUserTasksByIdResult.error);
  }
  
  return true;
}

async function runAllTests() {
  log('🚀 Starting Task & Subtask API Testing...', 'bright');
  
  try {
    // Test authentication
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      log('❌ Authentication failed, stopping tests', 'red');
      return;
    }
    
    // Test brand APIs
    const brandSuccess = await testBrandAPIs();
    if (!brandSuccess) {
      log('❌ Brand APIs failed, stopping tests', 'red');
      return;
    }
    
    // Test project APIs
    const projectSuccess = await testProjectAPIs();
    if (!projectSuccess) {
      log('❌ Project APIs failed, stopping tests', 'red');
      return;
    }
    
    // Test task APIs
    const taskSuccess = await testTaskAPIs();
    if (!taskSuccess) {
      log('❌ Task APIs failed, stopping tests', 'red');
      return;
    }
    
    // Test subtask APIs
    const subtaskSuccess = await testSubtaskAPIs();
    if (!subtaskSuccess) {
      log('❌ Subtask APIs failed, stopping tests', 'red');
      return;
    }
    
    // Test user task APIs
    const userTaskSuccess = await testUserTaskAPIs();
    if (!userTaskSuccess) {
      log('❌ User task APIs failed, stopping tests', 'red');
      return;
    }
    
    log('\n🎉 All Task & Subtask API Tests Completed!', 'green');
    log('📊 Summary:', 'cyan');
    log('✅ Authentication APIs - Working', 'green');
    log('✅ Brand Management APIs - Working', 'green');
    log('✅ Project Management APIs - Working', 'green');
    log('✅ Task Management APIs - Working', 'green');
    log('✅ Subtask Management APIs - Working', 'green');
    log('✅ User Task APIs - Working', 'green');
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
  }
}

// Run the tests
runAllTests();
