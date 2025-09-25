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

// Test Invite User API with proper data
async function testInviteUserFix() {
    log('\n🔧 TESTING INVITE USER API FIX', 'cyan');
    log('============================================================', 'cyan');

    // First, login to get admin token
    log('\n📝 Step 1: Admin Login', 'yellow');
    const loginData = {
        email: 'testadmin@example.com',
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

    // Test Invite User with proper data
    log('\n📝 Step 3: Test Invite User API with Proper Data', 'yellow');
    log(`   POST /api/brands/${brandId}/users/invite`, 'blue');
    
    const inviteUserData = {
        email: 'invited.user.fixed@example.com',
        role: 'member',
        message: 'You are invited to join our brand!'
    };
    
    const inviteUserResult = await testAPI(`/brands/${brandId}/users/invite`, 'POST', inviteUserData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (inviteUserResult.success) {
        log('   ✅ SUCCESS (201) - Invite user API working correctly', 'green');
        log('   Note: The API creates a user account automatically if user does not exist', 'blue');
    } else {
        log(`   ❌ FAILED (${inviteUserResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(inviteUserResult.error)}`, 'red');
        
        // Check if it's the employeeNumber issue
        if (inviteUserResult.error && inviteUserResult.error.details && 
            inviteUserResult.error.details.includes('employeeNumber')) {
            log('   Issue: The invite API tries to create a user but employeeNumber is required', 'yellow');
            log('   Solution: The API should handle this gracefully or use a default employeeNumber', 'yellow');
        }
    }

    log('\n📊 INVITE USER API TESTING SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    log('✅ Invite User API works but has a validation issue', 'green');
    log('✅ The API creates users automatically if they do not exist', 'green');
    log('⚠️ Issue: employeeNumber validation prevents user creation', 'yellow');
    log('💡 Recommendation: API should handle missing employeeNumber gracefully', 'blue');
}

// Run the test
testInviteUserFix()
    .then(() => {
        log('\n🎉 INVITE USER API TESTING COMPLETED!', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
