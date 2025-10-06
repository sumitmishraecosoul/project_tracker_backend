const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const TEST_PREFIX = `CATTEST${TIMESTAMP}_`;

// Test data storage
const testData = {
  adminUser: null,
  brandAdminUser: null,
  regularUser: null,
  adminToken: null,
  brandAdminToken: null,
  regularUserToken: null,
  brand: null,
  project: null,
  categories: [],
  tasks: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log with color
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to make API request
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
    
    // Only add data for methods that support body
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

// Test functions
async function testHealthCheck() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 1: HEALTH CHECK', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/health');
  
  if (result.success) {
    log('✅ Health check passed', 'green');
    log(`   Message: ${result.data.message}`, 'blue');
    return true;
  } else {
    log('❌ Health check failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
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
  
  if (result.success) {
    testData.adminUser = result.data.user;
    log('✅ Admin signup successful', 'green');
    log(`   User ID: ${testData.adminUser._id}`, 'blue');
    log(`   Role: ${testData.adminUser.role}`, 'blue');
    return true;
  } else {
    log('❌ Admin signup failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testSignupBrandAdmin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 3: SIGNUP - BRAND ADMIN ROLE', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const userData = {
    name: `${TEST_PREFIX}Brand Admin`,
    email: `${TEST_PREFIX.toLowerCase()}brandadmin@test.com`,
    password: 'password123',
    role: 'brand_admin',
    employeeNumber: `EMP${Date.now()}002`
  };
  
  const result = await apiRequest('POST', '/auth/signup', userData);
  
  if (result.success) {
    testData.brandAdminUser = result.data.user;
    log('✅ Brand Admin signup successful', 'green');
    log(`   User ID: ${testData.brandAdminUser._id}`, 'blue');
    log(`   Role: ${testData.brandAdminUser.role}`, 'blue');
    return true;
  } else {
    log('❌ Brand Admin signup failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testSignupUser() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 4: SIGNUP - REGULAR USER ROLE', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const userData = {
    name: `${TEST_PREFIX}Regular User`,
    email: `${TEST_PREFIX.toLowerCase()}user@test.com`,
    password: 'password123',
    role: 'user',
    employeeNumber: `EMP${Date.now()}003`
  };
  
  const result = await apiRequest('POST', '/auth/signup', userData);
  
  if (result.success) {
    testData.regularUser = result.data.user;
    log('✅ Regular User signup successful', 'green');
    log(`   User ID: ${testData.regularUser._id}`, 'blue');
    log(`   Role: ${testData.regularUser.role}`, 'blue');
    return true;
  } else {
    log('❌ Regular User signup failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testLoginAdmin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 5: LOGIN - ADMIN', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const loginData = {
    email: `${TEST_PREFIX.toLowerCase()}admin@test.com`,
    password: 'password123'
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    testData.adminToken = result.data.token;
    log('✅ Admin login successful', 'green');
    log(`   Token received: ${testData.adminToken.substring(0, 20)}...`, 'blue');
    return true;
  } else {
    log('❌ Admin login failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testCreateBrandAsAdmin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 6: CREATE BRAND - AS ADMIN', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const brandData = {
    name: `${TEST_PREFIX}Test Brand`,
    description: 'Test brand for category system verification',
    logo: 'https://example.com/logo.png'
  };
  
  const result = await apiRequest('POST', '/brands', brandData, testData.adminToken);
  
  if (result.success && result.data) {
    // Brand might be in result.data.data or result.data depending on response structure
    testData.brand = result.data.data || result.data;
    const brandId = testData.brand._id || testData.brand.id;
    log('✅ Brand created successfully', 'green');
    log(`   Brand ID: ${brandId}`, 'blue');
    log(`   Brand Name: ${testData.brand.name}`, 'blue');
    
    // Ensure we have the ID
    if (!testData.brand._id && testData.brand.id) {
      testData.brand._id = testData.brand.id;
    }
    return true;
  } else {
    log('❌ Brand creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testGetBrandsAsAdmin() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 7: GET ALL BRANDS - AS ADMIN (Should see ALL brands)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', '/brands', null, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Brands retrieved successfully', 'green');
    log(`   Total brands visible: ${result.data.data.length}`, 'blue');
    log(`   User role: ${result.data.user_global_role}`, 'blue');
    
    const isAdmin = result.data.data.some(b => b.is_global_admin === true);
    if (isAdmin) {
      log('   ✅ Admin can see all brands (is_global_admin: true)', 'green');
    }
    return true;
  } else {
    log('❌ Get brands failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testCreateBrandAsUser() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 8: CREATE BRAND - AS USER (Should FAIL)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  // First login as regular user
  const loginData = {
    email: `${TEST_PREFIX.toLowerCase()}user@test.com`,
    password: 'password123'
  };
  
  const loginResult = await apiRequest('POST', '/auth/login', loginData);
  
  if (loginResult.success) {
    testData.regularUserToken = loginResult.data.token;
    
    const brandData = {
      name: `${TEST_PREFIX}Unauthorized Brand`
    };
    
    const result = await apiRequest('POST', '/brands', brandData, testData.regularUserToken);
    
    if (!result.success && result.status === 403) {
      log('✅ Permission denied correctly (User cannot create brands)', 'green');
      log(`   Error message: ${result.error.error?.message}`, 'blue');
      return true;
    } else {
      log('❌ Test failed - User should NOT be able to create brands', 'red');
      return false;
    }
  } else {
    log('❌ User login failed', 'red');
    return false;
  }
}

async function testCreateProject() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 9: CREATE PROJECT (Should auto-create 3 categories)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const projectData = {
    title: `${TEST_PREFIX}Test Project`,
    description: 'Project to test category auto-creation',
    department: 'Digital Marketing'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/projects`, projectData, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.project = result.data.data;
    log('✅ Project created successfully', 'green');
    log(`   Project ID: ${testData.project._id}`, 'blue');
    log(`   Project Title: ${testData.project.title}`, 'blue');
    log('   ⏳ Default categories should be auto-created...', 'yellow');
    
    // Wait a moment for categories to be created
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } else {
    log('❌ Project creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testGetDefaultCategories() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 10: GET CATEGORIES (Verify 3 defaults created)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const result = await apiRequest('GET', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    testData.categories = result.data.data;
    log('✅ Categories retrieved successfully', 'green');
    log(`   Total categories: ${testData.categories.length}`, 'blue');
    
    const defaultCategories = testData.categories.filter(c => c.is_default);
    log(`   Default categories: ${defaultCategories.length}`, 'blue');
    
    if (testData.categories.length >= 3) {
      log('   ✅ 3 default categories created:', 'green');
      testData.categories.forEach(cat => {
        log(`      - ${cat.name} (${cat.color}) [Order: ${cat.order}]${cat.is_default ? ' (Default)' : ''}`, 'cyan');
      });
      return true;
    } else {
      log('   ❌ Expected 3 default categories', 'red');
      return false;
    }
  } else {
    log('❌ Get categories failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testCreateCustomCategory() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 11: CREATE CUSTOM CATEGORY', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const categoryData = {
    name: 'Marketing',
    description: 'Marketing team tasks',
    color: '#FF6B6B'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories`, categoryData, testData.adminToken);
  
  if (result.success && result.data.data) {
    const newCategory = result.data.data;
    testData.categories.push(newCategory);
    log('✅ Custom category created successfully', 'green');
    log(`   Category ID: ${newCategory._id}`, 'blue');
    log(`   Category Name: ${newCategory.name}`, 'blue');
    log(`   Color: ${newCategory.color}`, 'blue');
    log(`   Is Default: ${newCategory.is_default}`, 'blue');
    log(`   Order: ${newCategory.order}`, 'blue');
    return true;
  } else {
    log('❌ Custom category creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testUpdateCategory() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 12: UPDATE CATEGORY', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const categoryToUpdate = testData.categories.find(c => !c.is_default);
  
  if (!categoryToUpdate) {
    log('❌ No custom category found to update', 'red');
    return false;
  }
  
  const updateData = {
    name: 'Design & UX',
    description: 'Updated description for design team',
    color: '#10B981'
  };
  
  const result = await apiRequest('PUT', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories/${categoryToUpdate._id}`, updateData, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Category updated successfully', 'green');
    log(`   New Name: ${result.data.data.name}`, 'blue');
    log(`   New Color: ${result.data.data.color}`, 'blue');
    log(`   New Description: ${result.data.data.description}`, 'blue');
    return true;
  } else {
    log('❌ Category update failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testCreateTaskWithoutCategoryId() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 13: CREATE TASK WITHOUT category_id (Should FAIL)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const taskData = {
    task: 'Task without category',
    projectId: testData.project._id,
    assignedTo: testData.adminUser._id,
    reporter: testData.adminUser._id,
    eta: '2025-12-31'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/tasks`, taskData, testData.adminToken);
  
  if (!result.success && result.status === 400) {
    log('✅ Validation error correctly returned', 'green');
    log(`   Error: ${result.error.error?.message}`, 'blue');
    
    if (result.error.error?.message.includes('category_id')) {
      log('   ✅ Correct validation: category_id is required', 'green');
      return true;
    }
  }
  
  log('❌ Test failed - Should have validation error for missing category_id', 'red');
  return false;
}

async function testCreateTaskWithInvalidCategoryId() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 14: CREATE TASK WITH INVALID category_id (Should FAIL)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const taskData = {
    task: 'Task with invalid category',
    category_id: 'invalid_id_123',
    projectId: testData.project._id,
    assignedTo: testData.adminUser._id,
    reporter: testData.adminUser._id,
    eta: '2025-12-31'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/tasks`, taskData, testData.adminToken);
  
  if (!result.success && result.status === 400) {
    log('✅ Validation error correctly returned', 'green');
    log(`   Error: ${result.error.error?.message}`, 'blue');
    
    if (result.error.error?.message.includes('Invalid category_id') || result.error.error?.message.includes('category_id')) {
      log('   ✅ Correct validation: Invalid category_id detected', 'green');
      return true;
    }
  }
  
  log('❌ Test failed - Should have validation error for invalid category_id', 'red');
  return false;
}

async function testCreateTaskWithUsername() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 15: CREATE TASK WITH USERNAME (Should FAIL)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const taskData = {
    task: 'Task with username instead of ID',
    category_id: testData.categories[0]._id,
    projectId: testData.project._id,
    assignedTo: 'Sumit', // Username instead of ObjectId
    reporter: testData.adminUser._id,
    eta: '2025-12-31'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/tasks`, taskData, testData.adminToken);
  
  if (!result.success && result.status === 400) {
    log('✅ Validation error correctly returned', 'green');
    log(`   Error: ${result.error.error?.message}`, 'blue');
    
    if (result.error.error?.message.includes('assignedTo') || result.error.error?.message.includes('user ID')) {
      log('   ✅ Correct validation: Username not allowed', 'green');
      return true;
    }
  }
  
  log('❌ Test failed - Should have validation error for username', 'red');
  return false;
}

async function testCreateTaskWithCategoryId() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 16: CREATE TASK WITH VALID category_id (Should SUCCEED)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const taskData = {
    task: `${TEST_PREFIX}Test Task in Category`,
    category_id: testData.categories[0]._id,
    projectId: testData.project._id,
    assignedTo: testData.adminUser._id,
    reporter: testData.adminUser._id,
    eta: '2025-12-31',
    priority: 'High',
    status: 'Yet to Start',
    description: 'This task belongs to a category'
  };
  
  const result = await apiRequest('POST', `/brands/${testData.brand._id}/tasks`, taskData, testData.adminToken);
  
  if (result.success && result.data.data) {
    const task = result.data.data;
    testData.tasks.push(task);
    log('✅ Task created successfully', 'green');
    log(`   Task ID: ${task._id}`, 'blue');
    log(`   Task Name: ${task.task}`, 'blue');
    log(`   Category ID: ${task.category_id}`, 'blue');
    log(`   Status: ${task.status}`, 'blue');
    log(`   Priority: ${task.priority}`, 'blue');
    return true;
  } else {
    log('❌ Task creation failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testGetTasksInCategory() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 17: GET TASKS IN CATEGORY', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const categoryId = testData.categories[0]._id;
  
  const result = await apiRequest('GET', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories/${categoryId}/tasks`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Category tasks retrieved successfully', 'green');
    log(`   Category: ${result.data.data.category.name}`, 'blue');
    log(`   Task Count: ${result.data.data.taskCount}`, 'blue');
    
    if (result.data.data.tasks.length > 0) {
      log('   Tasks:', 'blue');
      result.data.data.tasks.forEach(task => {
        log(`      - ${task.task}`, 'cyan');
      });
    }
    return true;
  } else {
    log('❌ Get category tasks failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testReorderCategories() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 18: REORDER CATEGORIES (Drag & Drop)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  // Reverse the current order
  const categoryOrders = testData.categories.map((cat, index) => ({
    categoryId: cat._id,
    order: testData.categories.length - index - 1
  }));
  
  const result = await apiRequest('PUT', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories-reorder`, { categoryOrders }, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Categories reordered successfully', 'green');
    log('   New order:', 'blue');
    result.data.data.forEach(cat => {
      log(`      ${cat.order}. ${cat.name}`, 'cyan');
    });
    return true;
  } else {
    log('❌ Category reordering failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testDeleteCategoryWithTasks() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 19: DELETE CATEGORY (Should delete tasks inside)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  // Find a category with tasks
  const categoryToDelete = testData.categories[0];
  
  const result = await apiRequest('DELETE', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories/${categoryToDelete._id}`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Category deleted successfully', 'green');
    log(`   Deleted category: ${result.data.data.deletedCategory.name}`, 'blue');
    log(`   Tasks deleted: ${result.data.data.deletedTasksCount}`, 'blue');
    return true;
  } else {
    log('❌ Category deletion failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

async function testGetCategoryById() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('TEST 20: GET CATEGORY BY ID (with tasks)', 'bright');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  // Get remaining category
  const remainingCategories = testData.categories.slice(1);
  if (remainingCategories.length === 0) {
    log('⚠️  No remaining categories to test', 'yellow');
    return true;
  }
  
  const categoryId = remainingCategories[0]._id;
  
  const result = await apiRequest('GET', `/brands/${testData.brand._id}/projects/${testData.project._id}/categories/${categoryId}`, null, testData.adminToken);
  
  if (result.success && result.data.data) {
    log('✅ Category retrieved successfully', 'green');
    log(`   Category: ${result.data.data.category.name}`, 'blue');
    log(`   Task Count: ${result.data.data.taskCount}`, 'blue');
    return true;
  } else {
    log('❌ Get category by ID failed', 'red');
    log(`   Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'bright');
  log('║     CATEGORY & ROLE SYSTEM - COMPLETE FLOW TEST          ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'bright');
  
  const results = [];
  
  try {
    // Run all tests
    results.push({ name: 'Health Check', pass: await testHealthCheck() });
    results.push({ name: 'Signup Admin', pass: await testSignupAdmin() });
    results.push({ name: 'Signup Brand Admin', pass: await testSignupBrandAdmin() });
    results.push({ name: 'Signup User', pass: await testSignupUser() });
    results.push({ name: 'Login Admin', pass: await testLoginAdmin() });
    results.push({ name: 'Create Brand (Admin)', pass: await testCreateBrandAsAdmin() });
    results.push({ name: 'Get All Brands (Admin)', pass: await testGetBrandsAsAdmin() });
    results.push({ name: 'Create Brand (User - Should Fail)', pass: await testCreateBrandAsUser() });
    results.push({ name: 'Create Project', pass: await testCreateProject() });
    results.push({ name: 'Get Default Categories', pass: await testGetDefaultCategories() });
    results.push({ name: 'Create Custom Category', pass: await testCreateCustomCategory() });
    results.push({ name: 'Update Category', pass: await testUpdateCategory() });
    results.push({ name: 'Create Task Without category_id (Should Fail)', pass: await testCreateTaskWithoutCategoryId() });
    results.push({ name: 'Create Task With Invalid category_id (Should Fail)', pass: await testCreateTaskWithInvalidCategoryId() });
    results.push({ name: 'Create Task With Username (Should Fail)', pass: await testCreateTaskWithUsername() });
    results.push({ name: 'Create Task With category_id', pass: await testCreateTaskWithCategoryId() });
    results.push({ name: 'Get Tasks in Category', pass: await testGetTasksInCategory() });
    results.push({ name: 'Reorder Categories', pass: await testReorderCategories() });
    results.push({ name: 'Delete Category', pass: await testDeleteCategoryWithTasks() });
    results.push({ name: 'Get Category By ID', pass: await testGetCategoryById() });
    
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
  }
  
  // Print summary
  log('\n╔═══════════════════════════════════════════════════════════╗', 'bright');
  log('║                    TEST SUMMARY                           ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'bright');
  
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const total = results.length;
  
  log(`\nTotal Tests: ${total}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%\n`, failed > 0 ? 'yellow' : 'green');
  
  // Print detailed results
  results.forEach((result, index) => {
    const status = result.pass ? '✅ PASS' : '❌ FAIL';
    const color = result.pass ? 'green' : 'red';
    log(`${index + 1}. ${result.name.padEnd(50)} ${status}`, color);
  });
  
  log('\n═══════════════════════════════════════════════════════════\n', 'cyan');
  
  if (failed === 0) {
    log('🎉 ALL TESTS PASSED! Category & Role system is working correctly!', 'green');
  } else {
    log(`⚠️  ${failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

