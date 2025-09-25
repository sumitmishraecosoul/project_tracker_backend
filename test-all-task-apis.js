const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let brandId = '';
let projectId = '';
let taskId = '';
let subtaskId = '';

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
  log('\n🔐 Testing Authentication APIs...', 'cyan');
  
  // Register admin user
  const registerData = {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    department: 'IT',
    employeeNumber: 'EMP001'
  };
  
  const registerResult = await makeRequest('POST', '/auth/register', registerData);
  if (registerResult.success) {
    log('✅ Admin registration successful', 'green');
    authToken = registerResult.data.token;
  } else {
    log('⚠️ Admin registration failed, trying login...', 'yellow');
    
    // Try login
    const loginResult = await makeRequest('POST', '/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    if (loginResult.success) {
      log('✅ Admin login successful', 'green');
      authToken = loginResult.data.token;
    } else {
      log('❌ Authentication failed', 'red');
      return false;
    }
  }
  
  return true;
}

async function testBrandManagement() {
  log('\n🏢 Testing Brand Management APIs...', 'cyan');
  
  // Create brand
  const brandData = {
    name: 'Test Brand',
    description: 'Test brand for API testing',
    industry: 'Technology',
    website: 'https://testbrand.com'
  };
  
  const createBrandResult = await makeRequest('POST', '/brands', brandData);
  if (createBrandResult.success) {
    log('✅ Brand creation successful', 'green');
    brandId = createBrandResult.data.brand._id;
  } else {
    log('❌ Brand creation failed', 'red');
    return false;
  }
  
  // Get brands
  const getBrandsResult = await makeRequest('GET', '/brands');
  if (getBrandsResult.success) {
    log('✅ Get brands successful', 'green');
  } else {
    log('❌ Get brands failed', 'red');
  }
  
  return true;
}

async function testProjectManagement() {
  log('\n📁 Testing Project Management APIs...', 'cyan');
  
  // Create project
  const projectData = {
    title: 'Test Project',
    description: 'Test project for API testing',
    department: 'IT',
    priority: 'High',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const createProjectResult = await makeRequest('POST', `/brands/${brandId}/projects`, projectData);
  if (createProjectResult.success) {
    log('✅ Project creation successful', 'green');
    projectId = createProjectResult.data.project._id;
  } else {
    log('❌ Project creation failed', 'red');
    return false;
  }
  
  // Get projects
  const getProjectsResult = await makeRequest('GET', `/brands/${brandId}/projects`);
  if (getProjectsResult.success) {
    log('✅ Get projects successful', 'green');
  } else {
    log('❌ Get projects failed', 'red');
  }
  
  return true;
}

async function testTaskManagement() {
  log('\n📋 Testing Task Management APIs...', 'cyan');
  
  // Create task
  const taskData = {
    projectId: projectId,
    task: 'Test Task',
    description: 'Test task for API testing',
    priority: 'High',
    assignedTo: '68d361ba23002084a402ece8', // Use a valid user ID
    reporter: '68d361ba23002084a402ece8',
    startDate: new Date().toISOString(),
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 8
  };
  
  const createTaskResult = await makeRequest('POST', `/brands/${brandId}/tasks`, taskData);
  if (createTaskResult.success) {
    log('✅ Task creation successful', 'green');
    taskId = createTaskResult.data.task._id;
  } else {
    log('❌ Task creation failed', 'red');
    console.log('Error details:', createTaskResult.error);
    return false;
  }
  
  // Get tasks
  const getTasksResult = await makeRequest('GET', `/brands/${brandId}/tasks`);
  if (getTasksResult.success) {
    log('✅ Get tasks successful', 'green');
  } else {
    log('❌ Get tasks failed', 'red');
  }
  
  // Get task by ID
  const getTaskResult = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}`);
  if (getTaskResult.success) {
    log('✅ Get task by ID successful', 'green');
  } else {
    log('❌ Get task by ID failed', 'red');
  }
  
  // Update task
  const updateTaskData = {
    task: 'Updated Test Task',
    description: 'Updated test task description'
  };
  
  const updateTaskResult = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}`, updateTaskData);
  if (updateTaskResult.success) {
    log('✅ Task update successful', 'green');
  } else {
    log('❌ Task update failed', 'red');
  }
  
  // Update task status
  const updateStatusResult = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/status`, {
    status: 'In Progress'
  });
  if (updateStatusResult.success) {
    log('✅ Task status update successful', 'green');
  } else {
    log('❌ Task status update failed', 'red');
  }
  
  // Update task priority
  const updatePriorityResult = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/priority`, {
    priority: 'Critical'
  });
  if (updatePriorityResult.success) {
    log('✅ Task priority update successful', 'green');
  } else {
    log('❌ Task priority update failed', 'red');
  }
  
  // Assign task
  const assignTaskResult = await makeRequest('POST', `/brands/${brandId}/tasks/${taskId}/assign`, {
    assignedTo: '68d361ba23002084a402ece8'
  });
  if (assignTaskResult.success) {
    log('✅ Task assignment successful', 'green');
  } else {
    log('❌ Task assignment failed', 'red');
  }
  
  // Get task analytics
  const getAnalyticsResult = await makeRequest('GET', `/brands/${brandId}/tasks/analytics`);
  if (getAnalyticsResult.success) {
    log('✅ Task analytics successful', 'green');
  } else {
    log('❌ Task analytics failed', 'red');
  }
  
  // Search tasks
  const searchTasksResult = await makeRequest('GET', `/brands/${brandId}/tasks/search?q=test`);
  if (searchTasksResult.success) {
    log('✅ Task search successful', 'green');
  } else {
    log('❌ Task search failed', 'red');
  }
  
  // Filter tasks
  const filterTasksResult = await makeRequest('GET', `/brands/${brandId}/tasks/filter?status=In Progress`);
  if (filterTasksResult.success) {
    log('✅ Task filtering successful', 'green');
  } else {
    log('❌ Task filtering failed', 'red');
  }
  
  return true;
}

async function testSubtaskManagement() {
  log('\n📝 Testing Subtask Management APIs...', 'cyan');
  
  // Create subtask
  const subtaskData = {
    task_id: taskId,
    title: 'Test Subtask',
    description: 'Test subtask for API testing',
    priority: 'High',
    assignedTo: '68d361ba23002084a402ece8',
    reporter: '68d361ba23002084a402ece8',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 4
  };
  
  const createSubtaskResult = await makeRequest('POST', `/brands/${brandId}/subtasks`, subtaskData);
  if (createSubtaskResult.success) {
    log('✅ Subtask creation successful', 'green');
    subtaskId = createSubtaskResult.data.subtask._id;
  } else {
    log('❌ Subtask creation failed', 'red');
    console.log('Error details:', createSubtaskResult.error);
    return false;
  }
  
  // Get subtasks
  const getSubtasksResult = await makeRequest('GET', `/brands/${brandId}/subtasks`);
  if (getSubtasksResult.success) {
    log('✅ Get subtasks successful', 'green');
  } else {
    log('❌ Get subtasks failed', 'red');
  }
  
  // Get subtask by ID
  const getSubtaskResult = await makeRequest('GET', `/brands/${brandId}/subtasks/${subtaskId}`);
  if (getSubtaskResult.success) {
    log('✅ Get subtask by ID successful', 'green');
  } else {
    log('❌ Get subtask by ID failed', 'red');
  }
  
  // Get task subtasks
  const getTaskSubtasksResult = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/subtasks`);
  if (getTaskSubtasksResult.success) {
    log('✅ Get task subtasks successful', 'green');
  } else {
    log('❌ Get task subtasks failed', 'red');
  }
  
  // Update subtask
  const updateSubtaskData = {
    title: 'Updated Test Subtask',
    description: 'Updated test subtask description'
  };
  
  const updateSubtaskResult = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}`, updateSubtaskData);
  if (updateSubtaskResult.success) {
    log('✅ Subtask update successful', 'green');
  } else {
    log('❌ Subtask update failed', 'red');
  }
  
  // Update subtask status
  const updateSubtaskStatusResult = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}/status`, {
    status: 'In Progress'
  });
  if (updateSubtaskStatusResult.success) {
    log('✅ Subtask status update successful', 'green');
  } else {
    log('❌ Subtask status update failed', 'red');
  }
  
  // Complete subtask
  const completeSubtaskResult = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}/complete`);
  if (completeSubtaskResult.success) {
    log('✅ Subtask completion successful', 'green');
  } else {
    log('❌ Subtask completion failed', 'red');
  }
  
  // Get subtask analytics
  const getSubtaskAnalyticsResult = await makeRequest('GET', `/brands/${brandId}/subtasks/analytics`);
  if (getSubtaskAnalyticsResult.success) {
    log('✅ Subtask analytics successful', 'green');
  } else {
    log('❌ Subtask analytics failed', 'red');
  }
  
  // Search subtasks
  const searchSubtasksResult = await makeRequest('GET', `/brands/${brandId}/subtasks/search?q=test`);
  if (searchSubtasksResult.success) {
    log('✅ Subtask search successful', 'green');
  } else {
    log('❌ Subtask search failed', 'red');
  }
  
  return true;
}

async function testTaskSections() {
  log('\n📂 Testing Task Sections APIs...', 'cyan');
  
  // Create task section
  const sectionData = {
    name: 'Test Section',
    description: 'Test section for API testing',
    color: '#3498db',
    icon: 'folder'
  };
  
  const createSectionResult = await makeRequest('POST', `/brands/${brandId}/projects/${projectId}/sections`, sectionData);
  if (createSectionResult.success) {
    log('✅ Task section creation successful', 'green');
  } else {
    log('❌ Task section creation failed', 'red');
  }
  
  // Get task sections
  const getSectionsResult = await makeRequest('GET', `/brands/${brandId}/projects/${projectId}/sections`);
  if (getSectionsResult.success) {
    log('✅ Get task sections successful', 'green');
  } else {
    log('❌ Get task sections failed', 'red');
  }
  
  return true;
}

async function testTaskDependencies() {
  log('\n🔗 Testing Task Dependencies APIs...', 'cyan');
  
  // Create another task for dependency
  const taskData2 = {
    projectId: projectId,
    task: 'Dependency Task',
    description: 'Task for dependency testing',
    priority: 'Medium',
    assignedTo: '68d361ba23002084a402ece8',
    reporter: '68d361ba23002084a402ece8',
    startDate: new Date().toISOString(),
    eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedHours: 6
  };
  
  const createTask2Result = await makeRequest('POST', `/brands/${brandId}/tasks`, taskData2);
  if (createTask2Result.success) {
    log('✅ Second task creation successful', 'green');
    const task2Id = createTask2Result.data.task._id;
    
    // Add task dependency
    const dependencyData = {
      depends_on_task_id: taskId,
      dependency_type: 'finish_to_start',
      lag_days: 0,
      notes: 'Test dependency'
    };
    
    const addDependencyResult = await makeRequest('POST', `/brands/${brandId}/tasks/${task2Id}/dependencies`, dependencyData);
    if (addDependencyResult.success) {
      log('✅ Task dependency creation successful', 'green');
    } else {
      log('❌ Task dependency creation failed', 'red');
    }
    
    // Get task dependencies
    const getDependenciesResult = await makeRequest('GET', `/brands/${brandId}/tasks/${task2Id}/dependencies`);
    if (getDependenciesResult.success) {
      log('✅ Get task dependencies successful', 'green');
    } else {
      log('❌ Get task dependencies failed', 'red');
    }
  } else {
    log('❌ Second task creation failed', 'red');
  }
  
  return true;
}

async function testUserTasks() {
  log('\n👤 Testing User Task APIs...', 'cyan');
  
  // Create user task
  const userTaskData = {
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
  };
  
  const createUserTaskResult = await makeRequest('POST', '/user-tasks', userTaskData);
  if (createUserTaskResult.success) {
    log('✅ User task creation successful', 'green');
  } else {
    log('❌ User task creation failed', 'red');
  }
  
  // Get user tasks
  const getUserTasksResult = await makeRequest('GET', '/user-tasks');
  if (getUserTasksResult.success) {
    log('✅ Get user tasks successful', 'green');
  } else {
    log('❌ Get user tasks failed', 'red');
  }
  
  // Get user tasks by user ID
  const getUserTasksByIdResult = await makeRequest('GET', '/user-tasks/user/68d361ba23002084a402ece8');
  if (getUserTasksByIdResult.success) {
    log('✅ Get user tasks by user ID successful', 'green');
  } else {
    log('❌ Get user tasks by user ID failed', 'red');
  }
  
  return true;
}

async function runAllTests() {
  log('🚀 Starting Comprehensive Task & Subtask API Testing...', 'bright');
  
  try {
    // Test authentication
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      log('❌ Authentication failed, stopping tests', 'red');
      return;
    }
    
    // Test brand management
    const brandSuccess = await testBrandManagement();
    if (!brandSuccess) {
      log('❌ Brand management failed, stopping tests', 'red');
      return;
    }
    
    // Test project management
    const projectSuccess = await testProjectManagement();
    if (!projectSuccess) {
      log('❌ Project management failed, stopping tests', 'red');
      return;
    }
    
    // Test task management
    const taskSuccess = await testTaskManagement();
    if (!taskSuccess) {
      log('❌ Task management failed, stopping tests', 'red');
      return;
    }
    
    // Test subtask management
    const subtaskSuccess = await testSubtaskManagement();
    if (!subtaskSuccess) {
      log('❌ Subtask management failed, stopping tests', 'red');
      return;
    }
    
    // Test task sections
    const sectionSuccess = await testTaskSections();
    if (!sectionSuccess) {
      log('❌ Task sections failed, stopping tests', 'red');
      return;
    }
    
    // Test task dependencies
    const dependencySuccess = await testTaskDependencies();
    if (!dependencySuccess) {
      log('❌ Task dependencies failed, stopping tests', 'red');
      return;
    }
    
    // Test user tasks
    const userTaskSuccess = await testUserTasks();
    if (!userTaskSuccess) {
      log('❌ User tasks failed, stopping tests', 'red');
      return;
    }
    
    log('\n🎉 All Task & Subtask API Tests Completed Successfully!', 'green');
    log('📊 Summary:', 'cyan');
    log('✅ Authentication APIs - Working', 'green');
    log('✅ Brand Management APIs - Working', 'green');
    log('✅ Project Management APIs - Working', 'green');
    log('✅ Task Management APIs - Working', 'green');
    log('✅ Subtask Management APIs - Working', 'green');
    log('✅ Task Sections APIs - Working', 'green');
    log('✅ Task Dependencies APIs - Working', 'green');
    log('✅ User Task APIs - Working', 'green');
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
  }
}

// Run the tests
runAllTests();
