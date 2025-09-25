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

// Debug Projects API
async function debugProjectsAPI() {
    log('\n🔍 DEBUGGING PROJECTS API', 'cyan');
    log('============================================================', 'cyan');

    // First, login to get admin token
    log('\n📝 Step 1: Admin Login', 'yellow');
    const loginData = {
        email: 'testadmin.phase5@example.com',
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

    // Debug Projects API
    log('\n📝 Step 3: Debug Projects API', 'yellow');
    log(`   GET /api/brands/${brandId}/projects`, 'blue');
    
    const getProjectsResult = await testAPI(`/brands/${brandId}/projects`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    log(`   Response Status: ${getProjectsResult.status}`, 'blue');
    log(`   Response Success: ${getProjectsResult.success}`, 'blue');
    
    if (getProjectsResult.success) {
        log('   ✅ Projects API call successful', 'green');
        log(`   Response Data: ${JSON.stringify(getProjectsResult.data, null, 2)}`, 'blue');
        
        if (getProjectsResult.data.data && getProjectsResult.data.data.length > 0) {
            log(`   ✅ Found ${getProjectsResult.data.data.length} projects`, 'green');
            const projectId = getProjectsResult.data.data[0].id;
            log(`   ✅ First Project ID: ${projectId}`, 'green');
        } else {
            log('   ❌ No projects found in response', 'red');
        }
    } else {
        log(`   ❌ Projects API call failed (${getProjectsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getProjectsResult.error, null, 2)}`, 'red');
    }

    log('\n📊 DEBUG PROJECTS API SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    log('🔍 Debugging completed - check the response details above', 'blue');
}

// Run the debug
debugProjectsAPI()
    .then(() => {
        log('\n🎉 DEBUG PROJECTS API COMPLETED!', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
