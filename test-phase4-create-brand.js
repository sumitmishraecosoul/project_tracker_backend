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

// Create brand for Phase 4 testing
async function createBrandForPhase4() {
    log('\n🏢 CREATING BRAND FOR PHASE 4 TESTING', 'cyan');
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
        return null;
    }
    
    log('   ✅ Admin login successful', 'green');
    const adminToken = loginResult.data.token;

    // Create a brand for testing
    log('\n📝 Step 2: Create Brand', 'yellow');
    const createBrandData = {
        name: 'Phase 4 Test Brand',
        description: 'Brand created for Phase 4 project management testing',
        logo: 'https://example.com/logo.png',
        settings: {
            theme: 'light',
            notifications: true,
            timezone: 'UTC'
        }
    };
    
    const createBrandResult = await testAPI('/brands', 'POST', createBrandData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (createBrandResult.success) {
        log('   ✅ Brand created successfully', 'green');
        log(`   Brand ID: ${createBrandResult.data.data.id}`, 'blue');
        return {
            token: adminToken,
            brandId: createBrandResult.data.data.id
        };
    } else {
        log('   ❌ Brand creation failed', 'red');
        log(`   Error: ${JSON.stringify(createBrandResult.error)}`, 'red');
        return null;
    }
}

// Run the setup
createBrandForPhase4()
    .then(result => {
        if (result) {
            log('\n🎉 BRAND CREATION COMPLETED!', 'green');
            log(`✅ Admin Token: ${result.token.substring(0, 50)}...`, 'green');
            log(`✅ Brand ID: ${result.brandId}`, 'green');
            log('✅ Ready for Phase 4 testing', 'green');
        } else {
            log('\n❌ BRAND CREATION FAILED!', 'red');
            log('❌ Cannot proceed with Phase 4 testing', 'red');
        }
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
