const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const TEST_PREFIX = `ADMINTEST${TIMESTAMP}_`;

// Test data storage
const testData = {
  adminToken: null,
  brand1: null,
  brand2: null,
  project1: null,
  project2: null
};

// Helper function for API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers
    };
    
    if (data && method !== 'GET') {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Helper function for logging
function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bright: '\x1b[1m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 1: HEALTH CHECK', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/health');
  
  if (result.success) {
    log('✅ Health check passed', 'green');
    log(`   Message: ${result.data.message}`);
    return true;
  } else {
    log('❌ Health check failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testSignupAdmin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 2: SIGNUP - ADMIN ROLE', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const userData = {
    name: `${TEST_PREFIX}Admin User`,
    email: `${TEST_PREFIX.toLowerCase()}admin@test.com`,
    password: 'password123',
    role: 'admin',
    employeeNumber: `EMP${Date.now()}001`
  };
  
  const result = await apiRequest('POST', '/auth/signup', userData);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token;
    log('✅ Admin signup successful', 'green');
    log(`   User ID: ${result.data.user._id}`);
    log(`   Role: ${result.data.user.role}`);
    return true;
  } else {
    log('❌ Admin signup failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateBrand1() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 3: CREATE BRAND 1', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const brandData = {
    name: `${TEST_PREFIX}Brand 1`,
    description: 'First test brand for admin access testing',
    industry: 'Technology',
    website: 'https://brand1.test.com'
  };
  
  const result = await apiRequest('POST', '/brands', brandData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.brand1 = result.data.data;
    log('✅ Brand 1 created successfully', 'green');
    log(`   Brand ID: ${testData.brand1._id}`);
    log(`   Brand Name: ${testData.brand1.name}`);
    return true;
  } else {
    log('❌ Brand 1 creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateBrand2() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 4: CREATE BRAND 2', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const brandData = {
    name: `${TEST_PREFIX}Brand 2`,
    description: 'Second test brand for admin access testing',
    industry: 'Healthcare',
    website: 'https://brand2.test.com'
  };
  
  const result = await apiRequest('POST', '/brands', brandData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.brand2 = result.data.data;
    log('✅ Brand 2 created successfully', 'green');
    log(`   Brand ID: ${testData.brand2._id}`);
    log(`   Brand Name: ${testData.brand2.name}`);
    return true;
  } else {
    log('❌ Brand 2 creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testSwitchToBrand1() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 5: SWITCH TO BRAND 1', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('POST', `/brands/${testData.brand1._id}/switch`, {}, testData.adminToken);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token; // Update token with brand context
    log('✅ Successfully switched to Brand 1', 'green');
    log(`   Current Brand: ${result.data.data?.brand_name || 'Brand 1'}`);
    log(`   Role: ${result.data.data?.role || 'admin'}`);
    return true;
  } else {
    log('❌ Failed to switch to Brand 1', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProjectInBrand1() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 6: CREATE PROJECT IN BRAND 1', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectData = {
    title: `${TEST_PREFIX}Project in Brand 1`,
    description: 'Test project created in Brand 1',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand1._id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.project1 = result.data.data;
    log('✅ Project created successfully in Brand 1', 'green');
    log(`   Project ID: ${testData.project1._id}`);
    log(`   Project Title: ${testData.project1.title}`);
    return true;
  } else {
    log('❌ Project creation failed in Brand 1', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testSwitchToBrand2() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 7: SWITCH TO BRAND 2', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('POST', `/brands/${testData.brand2._id}/switch`, {}, testData.adminToken);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token; // Update token with brand context
    log('✅ Successfully switched to Brand 2', 'green');
    log(`   Current Brand: ${result.data.data?.brand_name || 'Brand 2'}`);
    log(`   Role: ${result.data.data?.role || 'admin'}`);
    return true;
  } else {
    log('❌ Failed to switch to Brand 2', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProjectInBrand2() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 8: CREATE PROJECT IN BRAND 2', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectData = {
    title: `${TEST_PREFIX}Project in Brand 2`,
    description: 'Test project created in Brand 2',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand2._id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.project2 = result.data.data;
    log('✅ Project created successfully in Brand 2', 'green');
    log(`   Project ID: ${testData.project2._id}`);
    log(`   Project Title: ${testData.project2.title}`);
    return true;
  } else {
    log('❌ Project creation failed in Brand 2', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetAllBrands() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 9: GET ALL BRANDS (Admin should see ALL)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/brands', null, testData.adminToken);
  
  if (result.success && result.data.data) {
    const brands = result.data.data;
    log('✅ Brands retrieved successfully', 'green');
    log(`   Total brands visible: ${brands.length}`);
    log(`   User role: ${result.data.user_global_role || 'admin'}`);
    
    // Check if admin can see both brands
    const brand1Visible = brands.some(b => b.id === testData.brand1._id);
    const brand2Visible = brands.some(b => b.id === testData.brand2._id);
    
    if (brand1Visible && brand2Visible) {
      log('✅ Admin can see both brands (is_global_admin: true)', 'green');
    } else {
      log('❌ Admin cannot see all brands', 'red');
    }
    
    return true;
  } else {
    log('❌ Get brands failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     ADMIN BRAND ACCESS - COMPLETE FLOW TEST              ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Signup Admin', fn: testSignupAdmin },
    { name: 'Create Brand 1', fn: testCreateBrand1 },
    { name: 'Create Brand 2', fn: testCreateBrand2 },
    { name: 'Switch to Brand 1', fn: testSwitchToBrand1 },
    { name: 'Create Project in Brand 1', fn: testCreateProjectInBrand1 },
    { name: 'Switch to Brand 2', fn: testSwitchToBrand2 },
    { name: 'Create Project in Brand 2', fn: testCreateProjectInBrand2 },
    { name: 'Get All Brands', fn: testGetAllBrands }
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
      log(`❌ Test suite error: ${error.message}`, 'red');
      failed++;
    }
  }
  
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST SUMMARY                           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  log(`Total Tests: ${tests.length}`);
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Admin brand access is working correctly!', 'green');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(console.error);

