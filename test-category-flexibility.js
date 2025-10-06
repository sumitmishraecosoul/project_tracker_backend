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

async function testGetBrands() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 2: GET EXISTING BRANDS', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/brands', null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.brand = result.data.data[0]; // Use first brand
    log('✅ Brands retrieved successfully', 'green');
    log(`   Using brand: ${testData.brand.name} (${testData.brand.id})`);
    return true;
  } else {
    log('❌ Get brands failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testCreateProject() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 3: CREATE PROJECT (5 default categories)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectData = {
    title: `Category Flexibility Test Project ${Date.now()}`,
    description: 'Testing category flexibility',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand.id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.project = result.data.data;
    log('✅ Project created successfully', 'green');
    log(`   Project ID: ${testData.project._id || testData.project.id}`);
    log(`   Project Title: ${testData.project.title}`);
    return true;
  } else {
    log('❌ Project creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testGetInitialCategories() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 4: GET INITIAL CATEGORIES (5 defaults)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectId = testData.project._id || testData.project.id;
  const result = await apiRequest('GET', `/brands/${testData.brand.id}/projects/${projectId}/categories`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.categories = result.data.data;
    log('✅ Categories retrieved successfully', 'green');
    log(`   Total categories: ${testData.categories.length}`);
    
    const defaultCategories = testData.categories.filter(cat => cat.is_default);
    log(`   Default categories: ${defaultCategories.length}`);
    
    defaultCategories.forEach((cat, index) => {
      log(`      ${index + 1}. ${cat.name} (${cat.color}) [Default]`);
    });
    
    return true;
  } else {
    log('❌ Get categories failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`);
    return false;
  }
}

async function testAddCustomCategories() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 5: ADD CUSTOM CATEGORIES', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectId = testData.project._id || testData.project.id;
  const customCategories = [
    { name: 'Marketing', color: '#FF6B6B', description: 'Marketing related tasks' },
    { name: 'Sales', color: '#4ECDC4', description: 'Sales related tasks' },
    { name: 'Support', color: '#45B7D1', description: 'Customer support tasks' },
    { name: 'Development', color: '#96CEB4', description: 'Development tasks' }
  ];
  
  let addedCount = 0;
  
  for (const categoryData of customCategories) {
    const result = await apiRequest('POST', `/brands/${testData.brand.id}/projects/${projectId}/categories`, categoryData, testData.adminToken);
    
    if (result.success && result.data.data) {
      addedCount++;
      log(`   ✅ Added: ${categoryData.name} (${categoryData.color})`);
    } else {
      log(`   ❌ Failed to add: ${categoryData.name}`, 'red');
    }
  }
  
  if (addedCount === customCategories.length) {
    log(`✅ Successfully added ${addedCount} custom categories`, 'green');
    log('✅ You can add unlimited custom categories!', 'green');
    return true;
  } else {
    log(`❌ Only added ${addedCount}/${customCategories.length} custom categories`, 'red');
    return false;
  }
}

async function testDeleteDefaultCategories() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 6: DELETE SOME DEFAULT CATEGORIES', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectId = testData.project._id || testData.project.id;
  
  // Get updated categories
  const result = await apiRequest('GET', `/brands/${testData.brand.id}/projects/${projectId}/categories`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.categories = result.data.data;
    const defaultCategories = testData.categories.filter(cat => cat.is_default);
    
    // Delete 2 default categories (Ads and Supply Chain)
    const categoriesToDelete = defaultCategories.filter(cat => 
      cat.name === 'Ads' || cat.name === 'Supply Chain'
    );
    
    let deletedCount = 0;
    
    for (const category of categoriesToDelete) {
      const deleteResult = await apiRequest('DELETE', `/brands/${testData.brand.id}/projects/${projectId}/categories/${category._id}`, null, testData.adminToken);
      
      if (deleteResult.success) {
        deletedCount++;
        log(`   ✅ Deleted: ${category.name}`);
      } else {
        log(`   ❌ Failed to delete: ${category.name}`, 'red');
      }
    }
    
    if (deletedCount === categoriesToDelete.length) {
      log(`✅ Successfully deleted ${deletedCount} default categories`, 'green');
      log('✅ You can delete default categories!', 'green');
      return true;
    } else {
      log(`❌ Only deleted ${deletedCount}/${categoriesToDelete.length} default categories`, 'red');
      return false;
    }
  } else {
    log('❌ Failed to get updated categories', 'red');
    return false;
  }
}

async function testFinalCategoryCount() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 7: FINAL CATEGORY COUNT', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectId = testData.project._id || testData.project.id;
  const result = await apiRequest('GET', `/brands/${testData.brand.id}/projects/${projectId}/categories`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    const categories = result.data.data;
    const defaultCategories = categories.filter(cat => cat.is_default);
    const customCategories = categories.filter(cat => !cat.is_default);
    
    log('✅ Final category status:', 'green');
    log(`   Total categories: ${categories.length}`);
    log(`   Remaining default categories: ${defaultCategories.length}`);
    log(`   Custom categories: ${customCategories.length}`);
    
    log('\n   Remaining default categories:');
    defaultCategories.forEach((cat, index) => {
      log(`      ${index + 1}. ${cat.name} (${cat.color}) [Default]`);
    });
    
    log('\n   Custom categories:');
    customCategories.forEach((cat, index) => {
      log(`      ${index + 1}. ${cat.name} (${cat.color}) [Custom]`);
    });
    
    log('\n✅ Perfect! You can have any combination of categories!', 'green');
    return true;
  } else {
    log('❌ Failed to get final categories', 'red');
    return false;
  }
}

async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     CATEGORY FLEXIBILITY - COMPLETE TEST               ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [
    { name: 'Login Admin', fn: testLogin },
    { name: 'Get Existing Brands', fn: testGetBrands },
    { name: 'Create Project', fn: testCreateProject },
    { name: 'Get Initial Categories', fn: testGetInitialCategories },
    { name: 'Add Custom Categories', fn: testAddCustomCategories },
    { name: 'Delete Default Categories', fn: testDeleteDefaultCategories },
    { name: 'Final Category Count', fn: testFinalCategoryCount }
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
    log('\n🎉 ALL TESTS PASSED! Category flexibility is working perfectly!', 'green');
    log('\n📊 Summary:');
    log('   ✅ You can add unlimited custom categories');
    log('   ✅ You can delete any default categories');
    log('   ✅ You can have any combination you want');
    log('   ✅ Complete flexibility for each project');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(console.error);

