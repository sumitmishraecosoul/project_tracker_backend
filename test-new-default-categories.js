const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// Test data storage
const testData = {
  adminToken: null,
  brand: null,
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

async function testCreateBrand() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 2: CREATE BRAND', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const brandData = {
    name: 'New Default Categories Test Brand',
    description: 'Testing new default categories',
    industry: 'Technology',
    website: 'https://test.com'
  };
  
  const result = await apiRequest('POST', '/brands', brandData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.brand = result.data.data;
    // Ensure _id is set correctly
    if (!testData.brand._id && testData.brand.id) {
      testData.brand._id = testData.brand.id;
    }
    log('✅ Brand created successfully', 'green');
    log(`   Brand ID: ${testData.brand._id}`);
    log(`   Brand Name: ${testData.brand.name}`);
    return true;
  } else {
    log('❌ Brand creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProject() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 3: CREATE PROJECT (Should auto-create 5 new default categories)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectData = {
    title: 'New Default Categories Test Project',
    description: 'Testing new default categories functionality',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.project = result.data.data;
    // Ensure _id is set correctly
    if (!testData.project._id && testData.project.id) {
      testData.project._id = testData.project.id;
    }
    log('✅ Project created successfully', 'green');
    log(`   Project ID: ${testData.project._id}`);
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
  
  const result = await apiRequest('GET', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories`, null, testData.adminToken);
  
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
      } else {
        log('❌ Some expected default categories are missing', 'red');
        log(`   Expected: ${expectedNames.join(', ')}`);
        log(`   Actual: ${actualNames.join(', ')}`);
      }
      
      return true;
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
  
  const updateData = {
    name: 'Operations - Updated',
    description: 'Updated operations category',
    color: '#FF6B6B'
  };
  
  const result = await apiRequest('PUT', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories/${operationsCategory._id}`, updateData, testData.adminToken);
  
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

async function testDeleteDefaultCategory() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 6: DELETE DEFAULT CATEGORY', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const miscCategory = testData.categories.find(cat => cat.name === 'Misc');
  if (!miscCategory) {
    log('❌ Misc category not found', 'red');
    return false;
  }
  
  const result = await apiRequest('DELETE', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories/${miscCategory._id}`, null, testData.adminToken);
  
  if (result.success) {
    log('✅ Default category deleted successfully', 'green');
    log('✅ Default categories are deletable!', 'green');
    return true;
  } else {
    log('❌ Default category deletion failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateCustomCategory() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 7: CREATE CUSTOM CATEGORY', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const categoryData = {
    name: 'Custom Category',
    description: 'A custom category created by user',
    color: '#FF1493'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories`, categoryData, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Custom category created successfully', 'green');
    log(`   Category ID: ${result.data.data._id}`);
    log(`   Category Name: ${result.data.data.name}`);
    log(`   Is Default: ${result.data.data.is_default}`);
    log('✅ Custom categories work alongside defaults!', 'green');
    return true;
  } else {
    log('❌ Custom category creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     NEW DEFAULT CATEGORIES - COMPLETE TEST             ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [
    { name: 'Login Admin', fn: testLogin },
    { name: 'Create Brand', fn: testCreateBrand },
    { name: 'Create Project', fn: testCreateProject },
    { name: 'Get New Default Categories', fn: testGetDefaultCategories },
    { name: 'Edit Default Category', fn: testEditDefaultCategory },
    { name: 'Delete Default Category', fn: testDeleteDefaultCategory },
    { name: 'Create Custom Category', fn: testCreateCustomCategory }
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
    log('   ✅ Default categories are deletable');
    log('   ✅ Custom categories work alongside defaults');
    log('   ✅ Full flexibility for future modifications');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(console.error);
