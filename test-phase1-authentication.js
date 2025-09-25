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
    phase1: {
        authentication: []
    }
};

let adminToken = null;
let testUserId = null;

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

// Phase 1: Authentication APIs Testing
async function testPhase1Authentication() {
    log('\n🔐 PHASE 1: AUTHENTICATION APIs TESTING', 'cyan');
    log('============================================================', 'cyan');

    // Test 1: User Registration
    log('\n📝 Testing: User Registration', 'yellow');
    log('   POST /api/auth/register', 'blue');
    
    const registerData = {
        name: 'Test User Phase1',
        email: 'testuser.phase1@example.com',
        password: 'password123',
        role: 'employee',
        department: 'India E-commerce',
        employeeNumber: 'EMP-PHASE1-001',
        jobTitle: 'Software Engineer',
        location: 'Bengaluru'
    };
    
    const registerResult = await testAPI('/auth/register', 'POST', registerData);
    
    if (registerResult.success) {
        log('   ✅ SUCCESS (201)', 'green');
        testUserId = registerResult.data.user?._id;
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/register',
            status: 'SUCCESS',
            statusCode: 201,
            request: registerData,
            response: registerResult.data,
            notes: 'User registration successful'
        });
    } else {
        log(`   ❌ FAILED (${registerResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(registerResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/register',
            status: 'FAILED',
            statusCode: registerResult.status,
            request: registerData,
            error: registerResult.error,
            notes: 'User registration failed'
        });
    }

    // Test 2: User Login
    log('\n📝 Testing: User Login', 'yellow');
    log('   POST /api/auth/login', 'blue');
    
    const loginData = {
        email: 'testuser.phase1@example.com',
        password: 'password123'
    };
    
    const loginResult = await testAPI('/auth/login', 'POST', loginData);
    
    if (loginResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        adminToken = loginResult.data.token;
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/login',
            status: 'SUCCESS',
            statusCode: 200,
            request: loginData,
            response: loginResult.data,
            notes: 'User login successful'
        });
    } else {
        log(`   ❌ FAILED (${loginResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(loginResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/login',
            status: 'FAILED',
            statusCode: loginResult.status,
            request: loginData,
            error: loginResult.error,
            notes: 'User login failed'
        });
    }

    // Test 3: Get User Profile
    log('\n📝 Testing: Get User Profile', 'yellow');
    log('   GET /api/auth/profile', 'blue');
    
    const profileResult = await testAPI('/auth/profile', 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (profileResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase1.authentication.push({
            endpoint: 'GET /api/auth/profile',
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: profileResult.data,
            notes: 'Get user profile successful'
        });
    } else {
        log(`   ❌ FAILED (${profileResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(profileResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'GET /api/auth/profile',
            status: 'FAILED',
            statusCode: profileResult.status,
            request: null,
            error: profileResult.error,
            notes: 'Get user profile failed'
        });
    }

    // Test 4: Update User Profile
    log('\n📝 Testing: Update User Profile', 'yellow');
    log('   PUT /api/auth/profile', 'blue');
    
    const updateProfileData = {
        name: 'Test User Phase1 Updated',
        jobTitle: 'Senior Software Engineer',
        location: 'Mumbai'
    };
    
    const updateProfileResult = await testAPI('/auth/profile', 'PUT', updateProfileData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (updateProfileResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase1.authentication.push({
            endpoint: 'PUT /api/auth/profile',
            status: 'SUCCESS',
            statusCode: 200,
            request: updateProfileData,
            response: updateProfileResult.data,
            notes: 'Update user profile successful'
        });
    } else {
        log(`   ❌ FAILED (${updateProfileResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(updateProfileResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'PUT /api/auth/profile',
            status: 'FAILED',
            statusCode: updateProfileResult.status,
            request: updateProfileData,
            error: updateProfileResult.error,
            notes: 'Update user profile failed'
        });
    }

    // Test 5: Change Password
    log('\n📝 Testing: Change Password', 'yellow');
    log('   POST /api/auth/change-password', 'blue');
    
    const changePasswordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
    };
    
    const changePasswordResult = await testAPI('/auth/change-password', 'POST', changePasswordData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (changePasswordResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/change-password',
            status: 'SUCCESS',
            statusCode: 200,
            request: changePasswordData,
            response: changePasswordResult.data,
            notes: 'Change password successful'
        });
    } else {
        log(`   ❌ FAILED (${changePasswordResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(changePasswordResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/change-password',
            status: 'FAILED',
            statusCode: changePasswordResult.status,
            request: changePasswordData,
            error: changePasswordResult.error,
            notes: 'Change password failed'
        });
    }

    // Test 6: Refresh Token
    log('\n📝 Testing: Refresh Token', 'yellow');
    log('   POST /api/auth/refresh-token', 'blue');
    
    const refreshTokenResult = await testAPI('/auth/refresh-token', 'POST', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (refreshTokenResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/refresh-token',
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: refreshTokenResult.data,
            notes: 'Refresh token successful'
        });
    } else {
        log(`   ❌ FAILED (${refreshTokenResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(refreshTokenResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/refresh-token',
            status: 'FAILED',
            statusCode: refreshTokenResult.status,
            request: null,
            error: refreshTokenResult.error,
            notes: 'Refresh token failed'
        });
    }

    // Test 7: Forgot Password
    log('\n📝 Testing: Forgot Password', 'yellow');
    log('   POST /api/auth/forgot-password', 'blue');
    
    const forgotPasswordData = {
        email: 'testuser.phase1@example.com'
    };
    
    const forgotPasswordResult = await testAPI('/auth/forgot-password', 'POST', forgotPasswordData);
    
    if (forgotPasswordResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/forgot-password',
            status: 'SUCCESS',
            statusCode: 200,
            request: forgotPasswordData,
            response: forgotPasswordResult.data,
            notes: 'Forgot password successful'
        });
    } else {
        log(`   ❌ FAILED (${forgotPasswordResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(forgotPasswordResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/forgot-password',
            status: 'FAILED',
            statusCode: forgotPasswordResult.status,
            request: forgotPasswordData,
            error: forgotPasswordResult.error,
            notes: 'Forgot password failed'
        });
    }

    // Test 8: Reset Password (This might fail without proper token)
    log('\n📝 Testing: Reset Password', 'yellow');
    log('   POST /api/auth/reset-password', 'blue');
    
    const resetPasswordData = {
        token: 'invalid-token-for-testing',
        newPassword: 'resetpassword123'
    };
    
    const resetPasswordResult = await testAPI('/auth/reset-password', 'POST', resetPasswordData);
    
    if (resetPasswordResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/reset-password',
            status: 'SUCCESS',
            statusCode: 200,
            request: resetPasswordData,
            response: resetPasswordResult.data,
            notes: 'Reset password successful'
        });
    } else {
        log(`   ❌ FAILED (${resetPasswordResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(resetPasswordResult.error)}`, 'red');
        testResults.phase1.authentication.push({
            endpoint: 'POST /api/auth/reset-password',
            status: 'FAILED',
            statusCode: resetPasswordResult.status,
            request: resetPasswordData,
            error: resetPasswordResult.error,
            notes: 'Reset password failed (expected with invalid token)'
        });
    }

    // Generate Phase 1 Report
    log('\n📊 PHASE 1 AUTHENTICATION TESTING SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    
    const totalTests = testResults.phase1.authentication.length;
    const successfulTests = testResults.phase1.authentication.filter(test => test.status === 'SUCCESS').length;
    const failedTests = testResults.phase1.authentication.filter(test => test.status === 'FAILED').length;
    
    log(`Total APIs Tested: ${totalTests}`, 'bright');
    log(`Successful: ${successfulTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(2)}%`, 'yellow');
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('phase1-authentication-results.json', JSON.stringify(testResults, null, 2));
    log('\n📄 Results saved to: phase1-authentication-results.json', 'green');
    
    return testResults;
}

// Run the test
testPhase1Authentication()
    .then(results => {
        log('\n🎉 PHASE 1 AUTHENTICATION TESTING COMPLETED!', 'green');
        log('📄 Results saved to: phase1-authentication-results.json', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
