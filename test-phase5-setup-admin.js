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

// Setup Admin User for Phase 5
async function setupAdminForPhase5() {
    log('\n🔧 SETTING UP ADMIN USER FOR PHASE 5', 'cyan');
    log('============================================================', 'cyan');

    // Step 1: Register Admin User
    log('\n📝 Step 1: Register Admin User', 'yellow');
    const registerData = {
        name: 'Test Admin Phase5',
        email: 'testadmin.phase5@example.com',
        password: 'admin123',
        role: 'admin',
        employeeNumber: 'EMP-PHASE5-001',
        department: 'India E-commerce'
    };
    
    const registerResult = await testAPI('/auth/register', 'POST', registerData);
    
    if (registerResult.success) {
        log('   ✅ Admin registration successful', 'green');
    } else {
        log(`   ❌ Admin registration failed (${registerResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(registerResult.error)}`, 'red');
        return;
    }

    // Step 2: Login Admin User
    log('\n📝 Step 2: Login Admin User', 'yellow');
    const loginData = {
        email: 'testadmin.phase5@example.com',
        password: 'admin123'
    };
    
    const loginResult = await testAPI('/auth/login', 'POST', loginData);
    
    if (loginResult.success) {
        log('   ✅ Admin login successful', 'green');
        const adminToken = loginResult.data.token;
        
        // Step 3: Create Brand for Admin
        log('\n📝 Step 3: Create Brand for Admin', 'yellow');
        const brandData = {
            name: 'Phase 5 Test Brand',
            description: 'Test brand for Phase 5 Task Management testing',
            website: 'https://phase5-test.com',
            industry: 'Technology',
            size: 'Medium',
            settings: {
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                currency: 'USD'
            }
        };
        
        const createBrandResult = await testAPI('/brands', 'POST', brandData, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (createBrandResult.success) {
            log('   ✅ Brand creation successful', 'green');
            const brandId = createBrandResult.data.data.id;
            log(`   ✅ Brand ID: ${brandId}`, 'green');
            
            // Step 4: Create Project for Testing
            log('\n📝 Step 4: Create Project for Testing', 'yellow');
            const projectData = {
                title: 'Phase 5 Test Project',
                description: 'Test project for Phase 5 Task Management testing',
                department: 'India E-commerce',
                priority: 'High',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Active'
            };
            
            const createProjectResult = await testAPI(`/brands/${brandId}/projects`, 'POST', projectData, {
                'Authorization': `Bearer ${adminToken}`
            });
            
            if (createProjectResult.success) {
                log('   ✅ Project creation successful', 'green');
                const projectId = createProjectResult.data.data.id;
                log(`   ✅ Project ID: ${projectId}`, 'green');
                
                log('\n📊 PHASE 5 SETUP COMPLETED!', 'cyan');
                log('============================================================', 'cyan');
                log('✅ Admin user created and logged in', 'green');
                log('✅ Brand created for testing', 'green');
                log('✅ Project created for testing', 'green');
                log('✅ Ready for Phase 5 Task Management testing!', 'green');
                
                return {
                    adminToken,
                    brandId,
                    projectId,
                    adminId: loginResult.data.user.id
                };
            } else {
                log(`   ❌ Project creation failed (${createProjectResult.status})`, 'red');
                log(`   Error: ${JSON.stringify(createProjectResult.error)}`, 'red');
            }
        } else {
            log(`   ❌ Brand creation failed (${createBrandResult.status})`, 'red');
            log(`   Error: ${JSON.stringify(createBrandResult.error)}`, 'red');
        }
    } else {
        log(`   ❌ Admin login failed (${loginResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(loginResult.error)}`, 'red');
    }
}

// Run the setup
setupAdminForPhase5()
    .then((setupData) => {
        if (setupData) {
            log('\n🎉 PHASE 5 SETUP COMPLETED SUCCESSFULLY!', 'green');
            log(`Admin Token: ${setupData.adminToken}`, 'blue');
            log(`Brand ID: ${setupData.brandId}`, 'blue');
            log(`Project ID: ${setupData.projectId}`, 'blue');
            log(`Admin ID: ${setupData.adminId}`, 'blue');
        } else {
            log('\n❌ PHASE 5 SETUP FAILED!', 'red');
        }
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
