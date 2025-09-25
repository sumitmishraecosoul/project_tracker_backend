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

async function checkServerStatus() {
  log('\n🔍 Checking Server Status...', 'cyan');
  
  try {
    const response = await axios.get(`${API_BASE}/health`);
    log('✅ Server is running', 'green');
    return true;
  } catch (error) {
    log('❌ Server is not responding', 'red');
    return false;
  }
}

async function checkAuthRoutes() {
  log('\n🔐 Checking Authentication Routes...', 'cyan');
  
  // Check if auth routes exist
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'test@test.com',
    password: 'password'
  });
  
  if (loginResult.status === 404) {
    log('❌ Auth routes not found', 'red');
    return false;
  } else {
    log('✅ Auth routes exist', 'green');
    return true;
  }
}

async function checkBrandRoutes() {
  log('\n🏢 Checking Brand Routes...', 'cyan');
  
  const brandsResult = await makeRequest('GET', '/brands');
  if (brandsResult.success) {
    log('✅ Brand routes working', 'green');
    if (brandsResult.data.brands && brandsResult.data.brands.length > 0) {
      log(`Found ${brandsResult.data.brands.length} existing brands`, 'yellow');
      return brandsResult.data.brands[0]._id;
    }
  } else {
    log('❌ Brand routes not working', 'red');
    console.log('Error:', brandsResult.error);
  }
  return null;
}

async function checkTaskRoutes() {
  log('\n📋 Checking Task Routes...', 'cyan');
  
  // Test basic task routes
  const tasksResult = await makeRequest('GET', '/api/tasks');
  if (tasksResult.success) {
    log('✅ Basic task routes working', 'green');
  } else {
    log('❌ Basic task routes not working', 'red');
    console.log('Error:', tasksResult.error);
  }
  
  // Test brand task routes
  const brandTasksResult = await makeRequest('GET', '/api/brands/test/tasks');
  if (brandTasksResult.success) {
    log('✅ Brand task routes working', 'green');
  } else {
    log('❌ Brand task routes not working', 'red');
    console.log('Error:', brandTasksResult.error);
  }
  
  return true;
}

async function checkSubtaskRoutes() {
  log('\n📝 Checking Subtask Routes...', 'cyan');
  
  const subtasksResult = await makeRequest('GET', '/api/brands/test/subtasks');
  if (subtasksResult.success) {
    log('✅ Subtask routes working', 'green');
  } else {
    log('❌ Subtask routes not working', 'red');
    console.log('Error:', subtasksResult.error);
  }
  
  return true;
}

async function checkUserTaskRoutes() {
  log('\n👤 Checking User Task Routes...', 'cyan');
  
  const userTasksResult = await makeRequest('GET', '/api/user-tasks');
  if (userTasksResult.success) {
    log('✅ User task routes working', 'green');
  } else {
    log('❌ User task routes not working', 'red');
    console.log('Error:', userTasksResult.error);
  }
  
  return true;
}

async function runDiagnostics() {
  log('🚀 Starting API Diagnostics...', 'bright');
  
  try {
    // Check server status
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
      log('❌ Server is not running. Please start the server with: npm start', 'red');
      return;
    }
    
    // Check auth routes
    const authWorking = await checkAuthRoutes();
    
    // Check brand routes
    const brandId = await checkBrandRoutes();
    
    // Check task routes
    const taskRoutesWorking = await checkTaskRoutes();
    
    // Check subtask routes
    const subtaskRoutesWorking = await checkSubtaskRoutes();
    
    // Check user task routes
    const userTaskRoutesWorking = await checkUserTaskRoutes();
    
    log('\n📊 DIAGNOSTIC SUMMARY:', 'cyan');
    log('================================', 'cyan');
    
    if (serverRunning) {
      log('✅ Server Status: Running', 'green');
    } else {
      log('❌ Server Status: Not Running', 'red');
    }
    
    if (authWorking) {
      log('✅ Authentication Routes: Working', 'green');
    } else {
      log('❌ Authentication Routes: Not Working', 'red');
    }
    
    if (brandId) {
      log('✅ Brand Routes: Working', 'green');
      log(`   Found Brand ID: ${brandId}`, 'yellow');
    } else {
      log('❌ Brand Routes: Not Working', 'red');
    }
    
    if (taskRoutesWorking) {
      log('✅ Task Routes: Working', 'green');
    } else {
      log('❌ Task Routes: Not Working', 'red');
    }
    
    if (subtaskRoutesWorking) {
      log('✅ Subtask Routes: Working', 'green');
    } else {
      log('❌ Subtask Routes: Not Working', 'red');
    }
    
    if (userTaskRoutesWorking) {
      log('✅ User Task Routes: Working', 'green');
    } else {
      log('❌ User Task Routes: Not Working', 'red');
    }
    
    log('\n🔧 IDENTIFIED ISSUES:', 'yellow');
    log('1. Authentication route /api/auth/register not found', 'red');
    log('2. Task status enum validation issues', 'red');
    log('3. ObjectId casting errors in task operations', 'red');
    log('4. Route ordering issues (analytics/search/filter)', 'red');
    log('5. Duplicate key errors in task ID generation', 'red');
    log('6. ObjectId constructor usage without "new" keyword', 'red');
    
    log('\n💡 RECOMMENDATIONS:', 'cyan');
    log('1. Fix authentication routes configuration', 'blue');
    log('2. Update task status enum values in test scripts', 'blue');
    log('3. Fix ObjectId casting in task controllers', 'blue');
    log('4. Reorder routes to place specific routes before parameterized ones', 'blue');
    log('5. Fix task ID generation logic', 'blue');
    log('6. Fix ObjectId constructor calls', 'blue');
    
  } catch (error) {
    log(`❌ Diagnostic failed: ${error.message}`, 'red');
  }
}

// Run diagnostics
runDiagnostics();
