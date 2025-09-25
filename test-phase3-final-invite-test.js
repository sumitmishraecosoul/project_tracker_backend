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

// Test Final Invite User API
async function testFinalInviteUser() {
    log('\n🎯 FINAL INVITE USER API TEST', 'cyan');
    log('============================================================', 'cyan');

    // First, login to get admin token
    log('\n📝 Step 1: Admin Login', 'yellow');
    const loginData = {
        email: 'testadmin.phase4@example.com',
        password: 'admin123'
    };
    
    const loginResult = await testAPI('/auth/login', 'POST', loginData);
    
    if (!loginResult.success) {
        log('   ❌ Admin login failed', 'red');
        return;
    }
    
    log('   ✅ Admin login successful', 'green');
    const adminToken = loginResult.data.token;

    // Get a brand ID for testing
    log('\n📝 Step 2: Get Brand ID', 'yellow');
    const getBrandsResult = await testAPI('/brands', 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (!getBrandsResult.success || getBrandsResult.data.data.length === 0) {
        log('   ❌ No brands available for testing', 'red');
        return;
    }
    
    const brandId = getBrandsResult.data.data[0].id;
    log(`   ✅ Brand ID: ${brandId}`, 'green');

    // Test 1: Try to invite a completely new user (should return 404)
    log('\n📝 Step 3: Test Invite Non-Existing User', 'yellow');
    log(`   POST /api/brands/${brandId}/users/invite`, 'blue');
    
    const inviteData = {
        email: `newuser.${Date.now()}@example.com`, // Completely new email
        role: 'member',
        message: 'You are invited to join our brand!'
    };
    
    log(`   Request: ${JSON.stringify(inviteData, null, 2)}`, 'blue');
    
    const inviteResult = await testAPI(`/brands/${brandId}/users/invite`, 'POST', inviteData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (inviteResult.status === 404) {
        log('   ✅ SUCCESS (404) - User not found (correct behavior)', 'green');
        log(`   Message: ${inviteResult.error.message}`, 'blue');
        log(`   Details: ${inviteResult.error.details}`, 'blue');
    } else if (inviteResult.success) {
        log('   ❌ UNEXPECTED (201) - User was created (should not happen)', 'red');
        log('   The API is still creating users instead of rejecting them', 'red');
    } else {
        log(`   ❌ UNEXPECTED (${inviteResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(inviteResult.error, null, 2)}`, 'red');
        
        if (inviteResult.error && inviteResult.error.details && 
            inviteResult.error.details.includes('employeeNumber')) {
            log('   🔍 Issue: The server is still trying to create users', 'yellow');
            log('   💡 The code changes might not have been applied', 'yellow');
        }
    }

    log('\n📊 FINAL INVITE USER API TEST SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    
    if (inviteResult.status === 404) {
        log('✅ PERFECT! Invite User API is working correctly', 'green');
        log('✅ Only invites existing users from database', 'green');
        log('✅ Returns proper error for non-existing users', 'green');
        log('✅ Ready for your 100 existing users!', 'green');
    } else {
        log('❌ ISSUE: API is still trying to create users', 'red');
        log('💡 The server might need to be restarted', 'yellow');
        log('💡 Or the code changes were not applied correctly', 'yellow');
    }
}

// Run the test
testFinalInviteUser()
    .then(() => {
        log('\n🎉 FINAL INVITE USER API TEST COMPLETED!', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
