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

// Setup admin user for Phase 4 testing
async function setupAdminForPhase4() {
    log('\n🔧 SETTING UP ADMIN USER FOR PHASE 4 TESTING', 'cyan');
    log('============================================================', 'cyan');

    // First, try to register a new admin user
    log('\n📝 Step 1: Register Admin User', 'yellow');
    const registerData = {
        name: 'Test Admin Phase4',
        email: 'testadmin.phase4@example.com',
        password: 'admin123',
        role: 'admin',
        department: 'India E-commerce',
        employeeNumber: 'EMP-ADMIN-001',
        jobTitle: 'System Administrator',
        location: 'Bengaluru'
    };
    
    const registerResult = await testAPI('/auth/register', 'POST', registerData);
    
    if (registerResult.success) {
        log('   ✅ Admin user registered successfully', 'green');
        log(`   Admin ID: ${registerResult.data.user._id}`, 'blue');
    } else {
        log('   ⚠️ Admin user registration failed (might already exist)', 'yellow');
        log(`   Error: ${JSON.stringify(registerResult.error)}`, 'yellow');
    }

    // Try to login with the admin user
    log('\n📝 Step 2: Admin Login', 'yellow');
    const loginData = {
        email: 'testadmin.phase4@example.com',
        password: 'admin123'
    };
    
    const loginResult = await testAPI('/auth/login', 'POST', loginData);
    
    if (loginResult.success) {
        log('   ✅ Admin login successful', 'green');
        log(`   Token: ${loginResult.data.token.substring(0, 50)}...`, 'blue');
        return loginResult.data.token;
    } else {
        log('   ❌ Admin login failed', 'red');
        log(`   Error: ${JSON.stringify(loginResult.error)}`, 'red');
        return null;
    }
}

// Run the setup
setupAdminForPhase4()
    .then(token => {
        if (token) {
            log('\n🎉 ADMIN SETUP COMPLETED!', 'green');
            log('✅ Ready for Phase 4 testing', 'green');
        } else {
            log('\n❌ ADMIN SETUP FAILED!', 'red');
            log('❌ Cannot proceed with Phase 4 testing', 'red');
        }
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
