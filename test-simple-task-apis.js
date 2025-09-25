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

async function testBasicAPIs() {
  log('\n📋 Testing Basic APIs...', 'cyan');
  
  const tests = [
    {
      name: 'Get All Brands',
      method: 'GET',
      url: '/brands',
      expectedStatus: 200
    },
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
  
  log(`\n📊 Basic APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function testBrandAPIs() {
  log('\n🏢 Testing Brand APIs...', 'cyan');
  
  // First get brands to find an existing brand
  const brandsResult = await makeRequest('GET', '/brands', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (!brandsResult.success || !brandsResult.data.brands || brandsResult.data.brands.length === 0) {
    log('❌ No brands found for testing', 'red');
    return false;
  }
  
  const brandId = brandsResult.data.brands[0]._id;
  log(`Using brand ID: ${brandId}`, 'blue');
  
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
  
  log(`\n📊 Brand APIs: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow');
  return passed === total;
}

async function runComprehensiveTest() {
  log('🚀 Starting Simple Task & Subtask API Testing...', 'bright');
  
  try {
    // Setup phase
    const authSuccess = await setupAuthentication();
    if (!authSuccess) return;
    
    // Test phases
    const basicAPIsSuccess = await testBasicAPIs();
    const brandAPIsSuccess = await testBrandAPIs();
    
    // Final summary
    log('\n📊 COMPREHENSIVE TEST SUMMARY:', 'cyan');
    log('================================', 'cyan');
    
    const results = [
      { name: 'Basic APIs', success: basicAPIsSuccess },
      { name: 'Brand APIs', success: brandAPIsSuccess }
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
      log('\n🎉 ALL APIs ARE WORKING PERFECTLY!', 'green');
    } else {
      log('\n⚠️ Some APIs need attention. Check the failed tests above.', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Test failed with error: ${error.message}`, 'red');
  }
}

// Run the comprehensive test
runComprehensiveTest();
