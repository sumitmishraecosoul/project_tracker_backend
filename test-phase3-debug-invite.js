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

// Debug Invite User API
async function debugInviteUser() {
    log('\n🔍 DEBUGGING INVITE USER API', 'cyan');
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

    // Test with a completely new email
    log('\n📝 Step 3: Test Invite Completely New User', 'yellow');
    log(`   POST /api/brands/${brandId}/users/invite`, 'blue');
    
    const inviteData = {
        email: `debuguser.${Date.now()}@example.com`, // Completely unique email
        role: 'member',
        message: 'You are invited to join our brand!'
    };
    
    log(`   Request Data: ${JSON.stringify(inviteData, null, 2)}`, 'blue');
    
    const inviteResult = await testAPI(`/brands/${brandId}/users/invite`, 'POST', inviteData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (inviteResult.success) {
        log('   ✅ SUCCESS (201) - Invite new user successful', 'green');
        log(`   Response: ${JSON.stringify(inviteResult.data, null, 2)}`, 'blue');
    } else {
        log(`   ❌ FAILED (${inviteResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(inviteResult.error, null, 2)}`, 'red');
        
        // Check if it's still the employeeNumber issue
        if (inviteResult.error && inviteResult.error.details && 
            inviteResult.error.details.includes('employeeNumber')) {
            log('   🔍 Issue: employeeNumber validation is still failing', 'yellow');
            log('   💡 The fix might not have been applied correctly', 'yellow');
        }
    }

    log('\n📊 DEBUG INVITE USER API SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    log('🔍 Debugging completed - check the error details above', 'blue');
}

// Run the test
debugInviteUser()
    .then(() => {
        log('\n🎉 DEBUG INVITE USER API COMPLETED!', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
