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
    phase2: {
        brandManagement: []
    }
};

let adminToken = null;
let brandId = null;

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

// Phase 2: Brand Management APIs Testing
async function testPhase2BrandManagement() {
    log('\n🏢 PHASE 2: BRAND MANAGEMENT APIs TESTING', 'cyan');
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
        log('   ❌ Admin login failed - trying alternative', 'red');
        // Try with testadmin@example.com
        const altLoginData = {
            email: 'testadmin@example.com',
            password: 'admin123'
        };
        const altLoginResult = await testAPI('/auth/login', 'POST', altLoginData);
        if (altLoginResult.success) {
            log('   ✅ Alternative admin login successful', 'green');
            adminToken = altLoginResult.data.token;
        } else {
            log('   ❌ All admin login attempts failed', 'red');
            log('   Error: Cannot proceed without authentication', 'red');
            return;
        }
    }

    // Test 1: Get All Brands
    log('\n📝 Testing: Get All Brands', 'yellow');
    log('   GET /api/brands', 'blue');
    
    const getBrandsResult = await testAPI('/brands', 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandsResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        if (getBrandsResult.data.data && getBrandsResult.data.data.length > 0) {
            brandId = getBrandsResult.data.data[0].id;
            log(`   Brand ID: ${brandId}`, 'blue');
        }
        testResults.phase2.brandManagement.push({
            endpoint: 'GET /api/brands',
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getBrandsResult.data,
            notes: 'Get all brands successful'
        });
    } else {
        log(`   ❌ FAILED (${getBrandsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getBrandsResult.error)}`, 'red');
        testResults.phase2.brandManagement.push({
            endpoint: 'GET /api/brands',
            status: 'FAILED',
            statusCode: getBrandsResult.status,
            request: null,
            error: getBrandsResult.error,
            notes: 'Get all brands failed'
        });
    }

    // Test 2: Create New Brand
    log('\n📝 Testing: Create New Brand', 'yellow');
    log('   POST /api/brands', 'blue');
    
    const createBrandData = {
        name: `Test Brand Phase2 ${Date.now()}`,
        description: 'Test brand for Phase 2 testing',
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
        log('   ✅ SUCCESS (201)', 'green');
        brandId = createBrandResult.data.data.id;
        log(`   Created Brand ID: ${brandId}`, 'blue');
        testResults.phase2.brandManagement.push({
            endpoint: 'POST /api/brands',
            status: 'SUCCESS',
            statusCode: 201,
            request: createBrandData,
            response: createBrandResult.data,
            notes: 'Create brand successful'
        });
    } else {
        log(`   ❌ FAILED (${createBrandResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(createBrandResult.error)}`, 'red');
        testResults.phase2.brandManagement.push({
            endpoint: 'POST /api/brands',
            status: 'FAILED',
            statusCode: createBrandResult.status,
            request: createBrandData,
            error: createBrandResult.error,
            notes: 'Create brand failed'
        });
    }

    // Test 3: Get Brand Details
    log('\n📝 Testing: Get Brand Details', 'yellow');
    log(`   GET /api/brands/${brandId}`, 'blue');
    
    const getBrandDetailsResult = await testAPI(`/brands/${brandId}`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandDetailsResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase2.brandManagement.push({
            endpoint: `GET /api/brands/${brandId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getBrandDetailsResult.data,
            notes: 'Get brand details successful'
        });
    } else {
        log(`   ❌ FAILED (${getBrandDetailsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getBrandDetailsResult.error)}`, 'red');
        testResults.phase2.brandManagement.push({
            endpoint: `GET /api/brands/${brandId}`,
            status: 'FAILED',
            statusCode: getBrandDetailsResult.status,
            request: null,
            error: getBrandDetailsResult.error,
            notes: 'Get brand details failed'
        });
    }

    // Test 4: Update Brand
    log('\n📝 Testing: Update Brand', 'yellow');
    log(`   PUT /api/brands/${brandId}`, 'blue');
    
    const updateBrandData = {
        name: `Updated Test Brand Phase2 ${Date.now()}`,
        description: 'Updated test brand description',
        settings: {
            theme: 'dark',
            notifications: false,
            timezone: 'Asia/Kolkata'
        }
    };
    
    const updateBrandResult = await testAPI(`/brands/${brandId}`, 'PUT', updateBrandData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (updateBrandResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase2.brandManagement.push({
            endpoint: `PUT /api/brands/${brandId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: updateBrandData,
            response: updateBrandResult.data,
            notes: 'Update brand successful'
        });
    } else {
        log(`   ❌ FAILED (${updateBrandResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(updateBrandResult.error)}`, 'red');
        testResults.phase2.brandManagement.push({
            endpoint: `PUT /api/brands/${brandId}`,
            status: 'FAILED',
            statusCode: updateBrandResult.status,
            request: updateBrandData,
            error: updateBrandResult.error,
            notes: 'Update brand failed'
        });
    }

    // Test 5: Switch to Brand
    log('\n📝 Testing: Switch to Brand', 'yellow');
    log(`   POST /api/brands/${brandId}/switch`, 'blue');
    
    const switchBrandResult = await testAPI(`/brands/${brandId}/switch`, 'POST', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (switchBrandResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase2.brandManagement.push({
            endpoint: `POST /api/brands/${brandId}/switch`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: switchBrandResult.data,
            notes: 'Switch to brand successful'
        });
    } else {
        log(`   ❌ FAILED (${switchBrandResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(switchBrandResult.error)}`, 'red');
        testResults.phase2.brandManagement.push({
            endpoint: `POST /api/brands/${brandId}/switch`,
            status: 'FAILED',
            statusCode: switchBrandResult.status,
            request: null,
            error: switchBrandResult.error,
            notes: 'Switch to brand failed'
        });
    }

    // Test 6: Delete Brand (Soft Delete)
    log('\n📝 Testing: Delete Brand (Soft Delete)', 'yellow');
    log(`   DELETE /api/brands/${brandId}`, 'blue');
    
    const deleteBrandResult = await testAPI(`/brands/${brandId}`, 'DELETE', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (deleteBrandResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase2.brandManagement.push({
            endpoint: `DELETE /api/brands/${brandId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: deleteBrandResult.data,
            notes: 'Delete brand successful (soft delete)'
        });
    } else {
        log(`   ❌ FAILED (${deleteBrandResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(deleteBrandResult.error)}`, 'red');
        testResults.phase2.brandManagement.push({
            endpoint: `DELETE /api/brands/${brandId}`,
            status: 'FAILED',
            statusCode: deleteBrandResult.status,
            request: null,
            error: deleteBrandResult.error,
            notes: 'Delete brand failed'
        });
    }

    // Generate Phase 2 Report
    log('\n📊 PHASE 2 BRAND MANAGEMENT TESTING SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    
    const totalTests = testResults.phase2.brandManagement.length;
    const successfulTests = testResults.phase2.brandManagement.filter(test => test.status === 'SUCCESS').length;
    const failedTests = testResults.phase2.brandManagement.filter(test => test.status === 'FAILED').length;
    
    log(`Total APIs Tested: ${totalTests}`, 'bright');
    log(`Successful: ${successfulTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(2)}%`, 'yellow');
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('phase2-brand-management-results.json', JSON.stringify(testResults, null, 2));
    log('\n📄 Results saved to: phase2-brand-management-results.json', 'green');
    
    return testResults;
}

// Run the test
testPhase2BrandManagement()
    .then(results => {
        log('\n🎉 PHASE 2 BRAND MANAGEMENT TESTING COMPLETED!', 'green');
        log('📄 Results saved to: phase2-brand-management-results.json', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
