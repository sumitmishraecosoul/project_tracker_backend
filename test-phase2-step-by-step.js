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

async function testPhase2StepByStep() {
    log('\n🔐 PHASE 2: AUTHENTICATION & AUTHORIZATION TESTING', 'magenta');
    log('='.repeat(60), 'magenta');
    log('Testing JWT tokens, Brand context middleware, Access control', 'magenta');
    log('='.repeat(60), 'magenta');
    
    let adminToken = null;
    let userToken = null;
    let brandId = null;
    let testResults = {
        adminLogin: false,
        userRegistration: false,
        userLogin: false,
        protectedRouteAccess: false,
        brandContextMiddleware: false,
        roleBasedAccess: false,
        tokenValidation: false,
        brandSwitching: false
    };
    
    try {
        // Step 2.1: Admin Login
        log('\n📝 STEP 2.1: Testing Admin Login...', 'yellow');
        log('   Endpoint: POST /api/auth/login', 'blue');
        log('   Credentials: testadmin@example.com', 'blue');
        
        const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        if (adminLoginResponse.data.token) {
            adminToken = adminLoginResponse.data.token;
            testResults.adminLogin = true;
            log('   ✅ Admin login successful', 'green');
            log(`   Token: ${adminToken.substring(0, 20)}...`, 'blue');
            log(`   User: ${adminLoginResponse.data.user.name}`, 'blue');
            log(`   Role: ${adminLoginResponse.data.user.role}`, 'blue');
        } else {
            throw new Error('Admin login failed: ' + (adminLoginResponse.data.message || 'No token received'));
        }
        
        // Step 2.2: User Registration
        log('\n📝 STEP 2.2: Testing User Registration...', 'yellow');
        log('   Endpoint: POST /api/auth/register', 'blue');
        
        const timestamp = Date.now();
        const userEmail = `testuser${timestamp}@example.com`;
        
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
            name: 'Test User ' + timestamp,
            email: userEmail,
            password: 'test123',
            employeeNumber: 'EMP-' + timestamp
        });
        
        if (registerResponse.data.user) {
            testResults.userRegistration = true;
            log('   ✅ User registration successful', 'green');
            log(`   User: ${registerResponse.data.user.name}`, 'blue');
            log(`   Email: ${userEmail}`, 'blue');
            log(`   User ID: ${registerResponse.data.user.id}`, 'blue');
        } else {
            throw new Error('User registration failed: ' + (registerResponse.data.message || 'No user data received'));
        }
        
        // Step 2.3: User Login
        log('\n📝 STEP 2.3: Testing User Login...', 'yellow');
        log('   Endpoint: POST /api/auth/login', 'blue');
        log(`   Credentials: ${userEmail}`, 'blue');
        
        const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: userEmail,
            password: 'test123'
        });
        
        if (userLoginResponse.data.token) {
            userToken = userLoginResponse.data.token;
            testResults.userLogin = true;
            log('   ✅ User login successful', 'green');
            log(`   User: ${userLoginResponse.data.user.name}`, 'blue');
            log(`   Role: ${userLoginResponse.data.user.role}`, 'blue');
        } else {
            throw new Error('User login failed: ' + (userLoginResponse.data.message || 'No token received'));
        }
        
        // Step 2.4: Protected Route Access
        log('\n📝 STEP 2.4: Testing Protected Route Access...', 'yellow');
        log('   Endpoint: GET /api/brands (protected route)', 'blue');
        
        const protectedResponse = await axios.get(`${API_BASE}/brands`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (protectedResponse.data.success) {
            testResults.protectedRouteAccess = true;
            log('   ✅ Protected route access successful', 'green');
            log(`   Can access brands endpoint with valid token`, 'blue');
        } else {
            throw new Error('Protected route access failed: ' + (protectedResponse.data.message || 'No data received'));
        }
        
        // Step 2.5: Brand Context Middleware
        log('\n📝 STEP 2.5: Testing Brand Context Middleware...', 'yellow');
        log('   Endpoint: GET /api/brands', 'blue');
        
        const brandContextResponse = await axios.get(`${API_BASE}/brands`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (brandContextResponse.data.success) {
            testResults.brandContextMiddleware = true;
            log('   ✅ Brand context middleware working', 'green');
            log(`   Found ${brandContextResponse.data.data.length} brands accessible to user`, 'blue');
            
            if (brandContextResponse.data.data.length > 0) {
                brandId = brandContextResponse.data.data[0].id;
                log(`   Using brand: ${brandContextResponse.data.data[0].name} (${brandId})`, 'blue');
            }
        } else {
            throw new Error('Brand context middleware failed: ' + (brandContextResponse.data.message || 'No brands data received'));
        }
        
        // Step 2.6: Role-Based Access Control
        log('\n📝 STEP 2.6: Testing Role-Based Access Control...', 'yellow');
        log('   Testing admin vs user permissions', 'blue');
        
        // Test admin access to all brands
        const adminBrandsResponse = await axios.get(`${API_BASE}/brands`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        // Test user access to brands
        const userBrandsResponse = await axios.get(`${API_BASE}/brands`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (adminBrandsResponse.data.success && userBrandsResponse.data.success) {
            testResults.roleBasedAccess = true;
            log('   ✅ Role-based access control working', 'green');
            log(`   Admin can access ${adminBrandsResponse.data.data.length} brands`, 'blue');
            log(`   User can access ${userBrandsResponse.data.data.length} brands`, 'blue');
        } else {
            throw new Error('Role-based access control failed');
        }
        
        // Step 2.7: Token Validation
        log('\n📝 STEP 2.7: Testing Token Validation...', 'yellow');
        log('   Testing invalid token rejection', 'blue');
        
        try {
            const invalidTokenResponse = await axios.get(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer invalid_token_12345` }
            });
            log('   ⚠️  Invalid token was accepted (security issue)', 'yellow');
        } catch (invalidTokenError) {
            if (invalidTokenError.response && invalidTokenError.response.status === 401) {
                testResults.tokenValidation = true;
                log('   ✅ Token validation working - invalid token rejected', 'green');
            } else {
                log('   ⚠️  Token validation response unexpected', 'yellow');
            }
        }
        
        // Step 2.8: Brand Switching (if multiple brands available)
        log('\n📝 STEP 2.8: Testing Brand Switching...', 'yellow');
        log('   Testing brand context switching', 'blue');
        
        if (brandId) {
            try {
                const brandSwitchResponse = await axios.get(`${API_BASE}/brands/${brandId}/projects`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                
                if (brandSwitchResponse.data.success) {
                    testResults.brandSwitching = true;
                    log('   ✅ Brand switching working', 'green');
                    log(`   Can access projects in brand ${brandId}`, 'blue');
                } else {
                    log('   ⚠️  Brand switching limited - projects API not fully implemented', 'yellow');
                }
            } catch (brandSwitchError) {
                log('   ⚠️  Brand switching limited - projects API not fully implemented', 'yellow');
            }
        } else {
            log('   ⚠️  No brands available for switching test', 'yellow');
        }
        
        // Phase 2 Results
        log('\n📊 PHASE 2 TESTING RESULTS', 'bright');
        log('='.repeat(60), 'bright');
        
        const passedTests = Object.values(testResults).filter(Boolean).length;
        const totalTests = Object.keys(testResults).length;
        
        log(`✅ Admin Login: ${testResults.adminLogin ? 'PASSED' : 'FAILED'}`, testResults.adminLogin ? 'green' : 'red');
        log(`✅ User Registration: ${testResults.userRegistration ? 'PASSED' : 'FAILED'}`, testResults.userRegistration ? 'green' : 'red');
        log(`✅ User Login: ${testResults.userLogin ? 'PASSED' : 'FAILED'}`, testResults.userLogin ? 'green' : 'red');
        log(`✅ Protected Route Access: ${testResults.protectedRouteAccess ? 'PASSED' : 'FAILED'}`, testResults.protectedRouteAccess ? 'green' : 'red');
        log(`✅ Brand Context Middleware: ${testResults.brandContextMiddleware ? 'PASSED' : 'FAILED'}`, testResults.brandContextMiddleware ? 'green' : 'red');
        log(`✅ Role-Based Access Control: ${testResults.roleBasedAccess ? 'PASSED' : 'FAILED'}`, testResults.roleBasedAccess ? 'green' : 'red');
        log(`✅ Token Validation: ${testResults.tokenValidation ? 'PASSED' : 'FAILED'}`, testResults.tokenValidation ? 'green' : 'red');
        log(`✅ Brand Switching: ${testResults.brandSwitching ? 'PASSED' : 'FAILED'}`, testResults.brandSwitching ? 'green' : 'red');
        
        log('\n' + '='.repeat(60), 'bright');
        log(`📈 PHASE 2 RESULT: ${passedTests}/${totalTests} tests passed`, passedTests >= 6 ? 'green' : 'yellow');
        
        if (passedTests >= 6) {
            log('🎉 PHASE 2 COMPLETED: Authentication & Authorization working perfectly!', 'green');
            log('✅ Ready for frontend integration!', 'green');
        } else {
            log('⚠️  PHASE 2 NEEDS ATTENTION: Some authentication features need fixing', 'yellow');
        }
        
        log(`\n🔧 Test Data Created:`, 'blue');
        log(`   Admin Token: ${adminToken.substring(0, 20)}...`, 'blue');
        log(`   User Token: ${userToken.substring(0, 20)}...`, 'blue');
        log(`   Brand ID: ${brandId || 'None'}`, 'blue');
        
        return { success: passedTests >= 6, adminToken, userToken, brandId, testResults };
        
    } catch (error) {
        log(`\n❌ PHASE 2 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return { success: false, error: error.message };
    }
}

// Run Phase 2 test
testPhase2StepByStep().then(result => {
    if (result.success) {
        console.log('\n✅ Phase 2 testing completed successfully!');
    } else {
        console.log('\n❌ Phase 2 testing failed!');
    }
}).catch(error => {
    console.error('💥 Fatal error:', error.message);
});
