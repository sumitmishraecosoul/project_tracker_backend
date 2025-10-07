const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// Test data storage
const testData = {
  adminToken: null,
  brands: [],
  project: null,
  categories: []
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

async function testLogin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 1: LOGIN ADMIN', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const loginData = {
    email: 'admin@system.local',
    password: 'admin123'
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token;
    log('✅ Admin login successful', 'green');
    return true;
  } else {
    log('❌ Admin login failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetBrands() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 2: GET EXISTING BRANDS', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/brands', null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.brands = result.data.data;
    log('✅ Brands retrieved successfully', 'green');
    log(`   Total brands: ${testData.brands.length}`);
    
    if (testData.brands.length > 0) {
      const firstBrand = testData.brands[0];
      log(`   Using brand: ${firstBrand.name} (${firstBrand.id})`);
      return true;
    } else {
      log('❌ No brands available', 'red');
      return false;
    }
  } else {
    log('❌ Get brands failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProject() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 3: CREATE PROJECT (Should auto-create 5 new default categories)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const firstBrand = testData.brands[0];
  const projectData = {
    title: `New Default Categories Test Project ${Date.now()}`,
    description: 'Testing new default categories functionality',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${firstBrand.id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.project = result.data.data;
    log('✅ Project created successfully', 'green');
    log(`   Project ID: ${testData.project._id || testData.project.id}`);
    log(`   Project Title: ${testData.project.title}`);
    log('⏳ New default categories should be auto-created...');
    return true;
  } else {
    log('❌ Project creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetDefaultCategories() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 4: GET NEW DEFAULT CATEGORIES', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const firstBrand = testData.brands[0];
  const projectId = testData.project._id || testData.project.id;
  
  const result = await apiRequest('GET', `/brands/${firstBrand.id}/projects/${projectId}/categories`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.categories = result.data.data;
    log('✅ Categories retrieved successfully', 'green');
    log(`   Total categories: ${testData.categories.length}`);
    
    const defaultCategories = testData.categories.filter(cat => cat.is_default);
    log(`   Default categories: ${defaultCategories.length}`);
    
    if (defaultCategories.length === 5) {
      log('✅ 5 new default categories created:', 'green');
      defaultCategories.forEach((cat, index) => {
        log(`      ${index + 1}. ${cat.name} (${cat.color}) [Order: ${cat.order}] (Default)`);
      });
      
      // Check if all expected categories are present
      const expectedNames = ['Operations', 'Ads', 'Supply Chain', 'Design', 'Misc'];
      const actualNames = defaultCategories.map(cat => cat.name);
      const allPresent = expectedNames.every(name => actualNames.includes(name));
      
      if (allPresent) {
        log('✅ All expected default categories are present', 'green');
        return true;
      } else {
        log('❌ Some expected default categories are missing', 'red');
        log(`   Expected: ${expectedNames.join(', ')}`);
        log(`   Actual: ${actualNames.join(', ')}`);
        return false;
      }
    } else {
      log(`❌ Expected 5 default categories, got ${defaultCategories.length}`, 'red');
      return false;
    }
  } else {
    log('❌ Get categories failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testEditDefaultCategory() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 5: EDIT DEFAULT CATEGORY', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const operationsCategory = testData.categories.find(cat => cat.name === 'Operations');
  if (!operationsCategory) {
    log('❌ Operations category not found', 'red');
    return false;
  }
  
  const firstBrand = testData.brands[0];
  const projectId = testData.project._id || testData.project.id;
  
  const updateData = {
    name: 'Operations - Updated',
    description: 'Updated operations category',
    color: '#FF6B6B'
  };
  
  const result = await apiRequest('PUT', `/brands/${firstBrand.id}/projects/${projectId}/categories/${operationsCategory._id}`, updateData, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Default category updated successfully', 'green');
    log(`   New Name: ${result.data.data.name}`);
    log(`   New Color: ${result.data.data.color}`);
    log(`   Description: ${result.data.data.description}`);
    log('✅ Default categories are editable!', 'green');
    return true;
  } else {
    log('❌ Default category update failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     NEW DEFAULT CATEGORIES - SIMPLE TEST               ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [
    { name: 'Login Admin', fn: testLogin },
    { name: 'Get Existing Brands', fn: testGetBrands },
    { name: 'Create Project', fn: testCreateProject },
    { name: 'Get New Default Categories', fn: testGetDefaultCategories },
    { name: 'Edit Default Category', fn: testEditDefaultCategory }
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
    log('\n🎉 ALL TESTS PASSED! New default categories are working correctly!', 'green');
    log('\n📊 Summary:');
    log('   ✅ 5 new default categories: Operations, Ads, Supply Chain, Design, Misc');
    log('   ✅ Default categories are editable');
    log('   ✅ Full flexibility for future modifications');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(console.error);

