const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// Test data storage
const testData = {
  adminToken: null,
  brands: [],
  projects: []
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

async function testLoginAdmin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 2: LOGIN - ADMIN USER', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const loginData = {
    email: 'admin@system.local',
    password: 'admin123'
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token;
    log('✅ Admin login successful', 'green');
    log(`   User: ${result.data.user.name}`);
    log(`   Role: ${result.data.user.role}`);
    return true;
  } else {
    log('❌ Admin login failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetAllBrands() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 3: GET ALL BRANDS (Admin should see ALL)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/brands', null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.brands = result.data.data;
    log('✅ Brands retrieved successfully', 'green');
    log(`   Total brands visible: ${testData.brands.length}`);
    log(`   User role: ${result.data.user_global_role || 'admin'}`);
    
    if (testData.brands.length > 0) {
      log('✅ Admin can see brands (is_global_admin: true)', 'green');
      testData.brands.forEach((brand, index) => {
        log(`   ${index + 1}. ${brand.name} (${brand.id})`);
      });
    }
    
    return true;
  } else {
    log('❌ Get brands failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testSwitchToFirstBrand() {
  if (testData.brands.length === 0) {
    log('❌ No brands available to switch to', 'red');
    return false;
  }
  
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 4: SWITCH TO FIRST BRAND', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const firstBrand = testData.brands[0];
  const result = await apiRequest('POST', `/brands/${firstBrand.id}/switch`, {}, testData.adminToken);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token; // Update token with brand context
    log('✅ Successfully switched to first brand', 'green');
    log(`   Current Brand: ${result.data.data?.brand_name || firstBrand.name}`);
    log(`   Role: ${result.data.data?.role || 'admin'}`);
    return true;
  } else {
    log('❌ Failed to switch to first brand', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProjectInFirstBrand() {
  if (testData.brands.length === 0) {
    log('❌ No brands available for project creation', 'red');
    return false;
  }
  
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 5: CREATE PROJECT IN FIRST BRAND', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const firstBrand = testData.brands[0];
  const projectData = {
    title: `Admin Test Project in ${firstBrand.name}`,
    description: 'Test project created by admin in first brand',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${firstBrand.id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.projects.push(result.data.data);
    log('✅ Project created successfully in first brand', 'green');
    log(`   Project ID: ${result.data.data._id}`);
    log(`   Project Title: ${result.data.data.title}`);
    return true;
  } else {
    log('❌ Project creation failed in first brand', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testSwitchToSecondBrand() {
  if (testData.brands.length < 2) {
    log('❌ Not enough brands to switch to second brand', 'red');
    return false;
  }
  
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 6: SWITCH TO SECOND BRAND', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const secondBrand = testData.brands[1];
  const result = await apiRequest('POST', `/brands/${secondBrand.id}/switch`, {}, testData.adminToken);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token; // Update token with brand context
    log('✅ Successfully switched to second brand', 'green');
    log(`   Current Brand: ${result.data.data?.brand_name || secondBrand.name}`);
    log(`   Role: ${result.data.data?.role || 'admin'}`);
    return true;
  } else {
    log('❌ Failed to switch to second brand', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProjectInSecondBrand() {
  if (testData.brands.length < 2) {
    log('❌ Not enough brands for project creation', 'red');
    return false;
  }
  
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 7: CREATE PROJECT IN SECOND BRAND', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const secondBrand = testData.brands[1];
  const projectData = {
    title: `Admin Test Project in ${secondBrand.name}`,
    description: 'Test project created by admin in second brand',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${secondBrand.id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.projects.push(result.data.data);
    log('✅ Project created successfully in second brand', 'green');
    log(`   Project ID: ${result.data.data._id}`);
    log(`   Project Title: ${result.data.data.title}`);
    return true;
  } else {
    log('❌ Project creation failed in second brand', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     ADMIN BRAND ACCESS - SIMPLE TEST                    ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Login Admin', fn: testLoginAdmin },
    { name: 'Get All Brands', fn: testGetAllBrands },
    { name: 'Switch to First Brand', fn: testSwitchToFirstBrand },
    { name: 'Create Project in First Brand', fn: testCreateProjectInFirstBrand },
    { name: 'Switch to Second Brand', fn: testSwitchToSecondBrand },
    { name: 'Create Project in Second Brand', fn: testCreateProjectInSecondBrand }
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
    log(`\n📊 Summary:`);
    log(`   - Admin can see ${testData.brands.length} brands`);
    log(`   - Admin can switch between brands`);
    log(`   - Admin can create projects in any brand`);
    log(`   - Created ${testData.projects.length} projects across brands`);
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(console.error);

