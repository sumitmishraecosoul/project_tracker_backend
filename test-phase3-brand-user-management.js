const axios = require('axios');

// Colors for terminal output
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

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const API_BASE = 'http://localhost:5000/api';

// Test results storage
let testResults = {
    phase3: {
        brandUserManagement: []
    }
};

let adminToken = null;
let brandId = null;
let testUserId = null;
let userBrandId = null;

// Helper function to make API calls
async function testAPI(endpoint, method = 'GET', data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
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

// Phase 3: Brand User Management APIs Testing
async function testPhase3BrandUserManagement() {
    log('\n👥 PHASE 3: BRAND USER MANAGEMENT APIs TESTING', 'cyan');
    log('============================================================', 'cyan');

    // First, login to get admin token
    log('\n📝 Step 1: Admin Login for Authentication', 'yellow');
    const loginData = {
        email: 'testadmin@example.com',
        password: 'admin123'
    };
    
    const loginResult = await testAPI('/auth/login', 'POST', loginData);
    
    if (loginResult.success) {
        log('   ✅ Admin login successful', 'green');
        adminToken = loginResult.data.token;
    } else {
        log('   ❌ Admin login failed', 'red');
        return;
    }

    // Get a brand ID for testing
    log('\n📝 Step 2: Get Brand ID for Testing', 'yellow');
    const getBrandsResult = await testAPI('/brands', 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandsResult.success && getBrandsResult.data.data.length > 0) {
        brandId = getBrandsResult.data.data[0].id;
        log(`   ✅ Brand ID: ${brandId}`, 'green');
    } else {
        log('   ❌ No brands available for testing', 'red');
        return;
    }

    // Create a test user for user management testing
    log('\n📝 Step 3: Create Test User for User Management', 'yellow');
    const createUserData = {
        name: 'Test User Phase3',
        email: 'testuser.phase3@example.com',
        password: 'password123',
        role: 'employee',
        department: 'India E-commerce',
        employeeNumber: 'EMP-PHASE3-001',
        jobTitle: 'Software Engineer',
        location: 'Bengaluru'
    };
    
    const createUserResult = await testAPI('/auth/register', 'POST', createUserData);
    
    if (createUserResult.success) {
        log('   ✅ Test user created successfully', 'green');
        testUserId = createUserResult.data.user._id;
        log(`   Test User ID: ${testUserId}`, 'blue');
    } else {
        log('   ❌ Failed to create test user', 'red');
        log(`   Error: ${JSON.stringify(createUserResult.error)}`, 'red');
        return;
    }

    // Test 1: Get Brand Users
    log('\n📝 Testing: Get Brand Users', 'yellow');
    log(`   GET /api/brands/${brandId}/users`, 'blue');
    
    const getBrandUsersResult = await testAPI(`/brands/${brandId}/users`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandUsersResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase3.brandUserManagement.push({
            endpoint: `GET /api/brands/${brandId}/users`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getBrandUsersResult.data,
            notes: 'Get brand users successful'
        });
    } else {
        log(`   ❌ FAILED (${getBrandUsersResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getBrandUsersResult.error)}`, 'red');
        testResults.phase3.brandUserManagement.push({
            endpoint: `GET /api/brands/${brandId}/users`,
            status: 'FAILED',
            statusCode: getBrandUsersResult.status,
            request: null,
            error: getBrandUsersResult.error,
            notes: 'Get brand users failed'
        });
    }

    // Test 2: Add User to Brand
    log('\n📝 Testing: Add User to Brand', 'yellow');
    log(`   POST /api/brands/${brandId}/users`, 'blue');
    
    const addUserData = {
        email: 'testuser.phase3@example.com',
        role: 'member',
        permissions: {
            can_create_tasks: true,
            can_edit_tasks: true,
            can_view_all_projects: true
        }
    };
    
    const addUserResult = await testAPI(`/brands/${brandId}/users`, 'POST', addUserData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (addUserResult.success) {
        log('   ✅ SUCCESS (201)', 'green');
        userBrandId = addUserResult.data.data.id;
        log(`   User-Brand ID: ${userBrandId}`, 'blue');
        testResults.phase3.brandUserManagement.push({
            endpoint: `POST /api/brands/${brandId}/users`,
            status: 'SUCCESS',
            statusCode: 201,
            request: addUserData,
            response: addUserResult.data,
            notes: 'Add user to brand successful'
        });
    } else {
        log(`   ❌ FAILED (${addUserResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(addUserResult.error)}`, 'red');
        testResults.phase3.brandUserManagement.push({
            endpoint: `POST /api/brands/${brandId}/users`,
            status: 'FAILED',
            statusCode: addUserResult.status,
            request: addUserData,
            error: addUserResult.error,
            notes: 'Add user to brand failed'
        });
    }

    // Test 3: Update User Role in Brand
    log('\n📝 Testing: Update User Role in Brand', 'yellow');
    log(`   PUT /api/brands/${brandId}/users/${testUserId}`, 'blue');
    
    const updateUserRoleData = {
        role: 'manager',
        permissions: {
            can_create_projects: true,
            can_edit_projects: true,
            can_create_tasks: true,
            can_edit_tasks: true,
            can_assign_tasks: true,
            can_view_analytics: true
        }
    };
    
    const updateUserRoleResult = await testAPI(`/brands/${brandId}/users/${testUserId}`, 'PUT', updateUserRoleData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (updateUserRoleResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase3.brandUserManagement.push({
            endpoint: `PUT /api/brands/${brandId}/users/${testUserId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: updateUserRoleData,
            response: updateUserRoleResult.data,
            notes: 'Update user role in brand successful'
        });
    } else {
        log(`   ❌ FAILED (${updateUserRoleResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(updateUserRoleResult.error)}`, 'red');
        testResults.phase3.brandUserManagement.push({
            endpoint: `PUT /api/brands/${brandId}/users/${testUserId}`,
            status: 'FAILED',
            statusCode: updateUserRoleResult.status,
            request: updateUserRoleData,
            error: updateUserRoleResult.error,
            notes: 'Update user role in brand failed'
        });
    }

    // Test 4: Invite User to Brand
    log('\n📝 Testing: Invite User to Brand', 'yellow');
    log(`   POST /api/brands/${brandId}/users/invite`, 'blue');
    
    const inviteUserData = {
        email: 'invited.user@example.com',
        role: 'member',
        message: 'You are invited to join our brand!'
    };
    
    const inviteUserResult = await testAPI(`/brands/${brandId}/users/invite`, 'POST', inviteUserData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (inviteUserResult.success) {
        log('   ✅ SUCCESS (201)', 'green');
        testResults.phase3.brandUserManagement.push({
            endpoint: `POST /api/brands/${brandId}/users/invite`,
            status: 'SUCCESS',
            statusCode: 201,
            request: inviteUserData,
            response: inviteUserResult.data,
            notes: 'Invite user to brand successful'
        });
    } else {
        log(`   ❌ FAILED (${inviteUserResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(inviteUserResult.error)}`, 'red');
        testResults.phase3.brandUserManagement.push({
            endpoint: `POST /api/brands/${brandId}/users/invite`,
            status: 'FAILED',
            statusCode: inviteUserResult.status,
            request: inviteUserData,
            error: inviteUserResult.error,
            notes: 'Invite user to brand failed'
        });
    }

    // Test 5: Remove User from Brand
    log('\n📝 Testing: Remove User from Brand', 'yellow');
    log(`   DELETE /api/brands/${brandId}/users/${testUserId}`, 'blue');
    
    const removeUserResult = await testAPI(`/brands/${brandId}/users/${testUserId}`, 'DELETE', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (removeUserResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase3.brandUserManagement.push({
            endpoint: `DELETE /api/brands/${brandId}/users/${testUserId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: removeUserResult.data,
            notes: 'Remove user from brand successful'
        });
    } else {
        log(`   ❌ FAILED (${removeUserResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(removeUserResult.error)}`, 'red');
        testResults.phase3.brandUserManagement.push({
            endpoint: `DELETE /api/brands/${brandId}/users/${testUserId}`,
            status: 'FAILED',
            statusCode: removeUserResult.status,
            request: null,
            error: removeUserResult.error,
            notes: 'Remove user from brand failed'
        });
    }

    // Generate Phase 3 Report
    log('\n📊 PHASE 3 BRAND USER MANAGEMENT TESTING SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    
    const totalTests = testResults.phase3.brandUserManagement.length;
    const successfulTests = testResults.phase3.brandUserManagement.filter(test => test.status === 'SUCCESS').length;
    const failedTests = testResults.phase3.brandUserManagement.filter(test => test.status === 'FAILED').length;
    
    log(`Total APIs Tested: ${totalTests}`, 'bright');
    log(`Successful: ${successfulTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(2)}%`, 'yellow');
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('phase3-brand-user-management-results.json', JSON.stringify(testResults, null, 2));
    log('\n📄 Results saved to: phase3-brand-user-management-results.json', 'green');
    
    return testResults;
}

// Run the test
testPhase3BrandUserManagement()
    .then(results => {
        log('\n🎉 PHASE 3 BRAND USER MANAGEMENT TESTING COMPLETED!', 'green');
        log('📄 Results saved to: phase3-brand-user-management-results.json', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
