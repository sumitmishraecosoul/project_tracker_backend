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

// Test Phases 3 and 4 APIs
async function testPhases3And4() {
    log('\n🎯 PHASES 3 & 4 VERIFICATION TESTING', 'cyan');
    log('============================================================', 'cyan');

    // Step 1: Register and Login Admin
    log('\n📝 Step 1: Setup Admin User', 'yellow');
    const registerData = {
        name: 'Test Admin Verification',
        email: 'testadmin.verification@example.com',
        password: 'admin123',
        role: 'admin',
        employeeNumber: 'EMP-VERIFY-001',
        department: 'India E-commerce'
    };
    
    const registerResult = await testAPI('/auth/register', 'POST', registerData);
    
    if (registerResult.success) {
        log('   ✅ Admin registration successful', 'green');
    } else {
        log(`   ❌ Admin registration failed (${registerResult.status})`, 'red');
        return;
    }

    const loginData = {
        email: 'testadmin.verification@example.com',
        password: 'admin123'
    };
    
    const loginResult = await testAPI('/auth/login', 'POST', loginData);
    
    if (!loginResult.success) {
        log('   ❌ Admin login failed', 'red');
        return;
    }
    
    log('   ✅ Admin login successful', 'green');
    const adminToken = loginResult.data.token;

    // Step 2: Create Brand
    log('\n📝 Step 2: Create Brand', 'yellow');
    const brandData = {
        name: 'Verification Test Brand',
        description: 'Test brand for verification',
        website: 'https://verification-test.com',
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
    
    if (!createBrandResult.success) {
        log(`   ❌ Brand creation failed (${createBrandResult.status})`, 'red');
        return;
    }
    
    log('   ✅ Brand creation successful', 'green');
    const brandId = createBrandResult.data.data.id;

    // Step 3: Create Project
    log('\n📝 Step 3: Create Project', 'yellow');
    const projectData = {
        title: 'Verification Test Project',
        description: 'Test project for verification',
        department: 'India E-commerce',
        priority: 'High',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active'
    };
    
    const createProjectResult = await testAPI(`/brands/${brandId}/projects`, 'POST', projectData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (!createProjectResult.success) {
        log(`   ❌ Project creation failed (${createProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(createProjectResult.error)}`, 'red');
        return;
    }
    
    log('   ✅ Project creation successful', 'green');
    const projectId = createProjectResult.data.data.id;

    const testResults = {
        phase3: { total: 0, passed: 0, failed: 0, details: [] },
        phase4: { total: 0, passed: 0, failed: 0, details: [] }
    };

    // PHASE 3 TESTS
    log('\n📝 PHASE 3: Brand User Management Tests', 'yellow');
    
    // Test 1: Get Brand Users
    log('\n📝 Test 1: Get Brand Users', 'yellow');
    testResults.phase3.total++;
    const getBrandUsersResult = await testAPI(`/brands/${brandId}/users`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandUsersResult.success) {
        log('   ✅ SUCCESS - Get brand users', 'green');
        testResults.phase3.passed++;
        testResults.phase3.details.push({
            endpoint: `GET /api/brands/${brandId}/users`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get brand users successful'
        });
    } else {
        log(`   ❌ FAILED (${getBrandUsersResult.status})`, 'red');
        testResults.phase3.failed++;
        testResults.phase3.details.push({
            endpoint: `GET /api/brands/${brandId}/users`,
            status: 'FAILED',
            statusCode: getBrandUsersResult.status,
            message: getBrandUsersResult.error?.message || 'Unknown error'
        });
    }

    // Test 2: Invite User (FIXED)
    log('\n📝 Test 2: Invite User (FIXED)', 'yellow');
    testResults.phase3.total++;
    const inviteUserData = {
        email: 'testadmin.verification@example.com', // Same user
        role: 'member',
        message: 'You are invited to join our brand!'
    };
    
    const inviteUserResult = await testAPI(`/brands/${brandId}/users/invite`, 'POST', inviteUserData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (inviteUserResult.success) {
        log('   ✅ SUCCESS - Invite user (existing user)', 'green');
        testResults.phase3.passed++;
        testResults.phase3.details.push({
            endpoint: `POST /api/brands/${brandId}/users/invite`,
            status: 'SUCCESS',
            statusCode: 201,
            message: 'Invite user successful'
        });
    } else {
        log(`   ❌ FAILED (${inviteUserResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(inviteUserResult.error)}`, 'red');
        testResults.phase3.failed++;
        testResults.phase3.details.push({
            endpoint: `POST /api/brands/${brandId}/users/invite`,
            status: 'FAILED',
            statusCode: inviteUserResult.status,
            message: inviteUserResult.error?.message || 'Unknown error'
        });
    }

    // PHASE 4 TESTS
    log('\n📝 PHASE 4: Project Management Tests', 'yellow');
    
    // Test 1: Get Brand Projects
    log('\n📝 Test 1: Get Brand Projects', 'yellow');
    testResults.phase4.total++;
    const getBrandProjectsResult = await testAPI(`/brands/${brandId}/projects`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandProjectsResult.success) {
        log('   ✅ SUCCESS - Get brand projects', 'green');
        testResults.phase4.passed++;
        testResults.phase4.details.push({
            endpoint: `GET /api/brands/${brandId}/projects`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get brand projects successful'
        });
    } else {
        log(`   ❌ FAILED (${getBrandProjectsResult.status})`, 'red');
        testResults.phase4.failed++;
        testResults.phase4.details.push({
            endpoint: `GET /api/brands/${brandId}/projects`,
            status: 'FAILED',
            statusCode: getBrandProjectsResult.status,
            message: getBrandProjectsResult.error?.message || 'Unknown error'
        });
    }

    // Test 2: Get Project by ID
    log('\n📝 Test 2: Get Project by ID', 'yellow');
    testResults.phase4.total++;
    const getProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProjectResult.success) {
        log('   ✅ SUCCESS - Get project by ID', 'green');
        testResults.phase4.passed++;
        testResults.phase4.details.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get project by ID successful'
        });
    } else {
        log(`   ❌ FAILED (${getProjectResult.status})`, 'red');
        testResults.phase4.failed++;
        testResults.phase4.details.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}`,
            status: 'FAILED',
            statusCode: getProjectResult.status,
            message: getProjectResult.error?.message || 'Unknown error'
        });
    }

    // Test 3: Update Project
    log('\n📝 Test 3: Update Project', 'yellow');
    testResults.phase4.total++;
    const updateProjectData = {
        title: 'Updated Verification Test Project',
        description: 'Updated test project for verification'
    };
    
    const updateProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}`, 'PUT', updateProjectData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (updateProjectResult.success) {
        log('   ✅ SUCCESS - Update project', 'green');
        testResults.phase4.passed++;
        testResults.phase4.details.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Update project successful'
        });
    } else {
        log(`   ❌ FAILED (${updateProjectResult.status})`, 'red');
        testResults.phase4.failed++;
        testResults.phase4.details.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}`,
            status: 'FAILED',
            statusCode: updateProjectResult.status,
            message: updateProjectResult.error?.message || 'Unknown error'
        });
    }

    // Test 4: Get Project Progress
    log('\n📝 Test 4: Get Project Progress', 'yellow');
    testResults.phase4.total++;
    const getProgressResult = await testAPI(`/brands/${brandId}/projects/${projectId}/progress`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProgressResult.success) {
        log('   ✅ SUCCESS - Get project progress', 'green');
        testResults.phase4.passed++;
        testResults.phase4.details.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/progress`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get project progress successful'
        });
    } else {
        log(`   ❌ FAILED (${getProgressResult.status})`, 'red');
        testResults.phase4.failed++;
        testResults.phase4.details.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/progress`,
            status: 'FAILED',
            statusCode: getProgressResult.status,
            message: getProgressResult.error?.message || 'Unknown error'
        });
    }

    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('phases-3-4-verification-results.json', JSON.stringify(testResults, null, 2));

    log('\n📊 PHASES 3 & 4 VERIFICATION SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    
    log('\n📝 PHASE 3 RESULTS:', 'yellow');
    log(`Total APIs Tested: ${testResults.phase3.total}`, 'blue');
    log(`Working APIs: ${testResults.phase3.passed}`, 'green');
    log(`Failed APIs: ${testResults.phase3.failed}`, 'red');
    log(`Success Rate: ${Math.round((testResults.phase3.passed / testResults.phase3.total) * 100)}%`, 'yellow');
    
    log('\n📝 PHASE 4 RESULTS:', 'yellow');
    log(`Total APIs Tested: ${testResults.phase4.total}`, 'blue');
    log(`Working APIs: ${testResults.phase4.passed}`, 'green');
    log(`Failed APIs: ${testResults.phase4.failed}`, 'red');
    log(`Success Rate: ${Math.round((testResults.phase4.passed / testResults.phase4.total) * 100)}%`, 'yellow');
    
    const totalWorking = testResults.phase3.passed + testResults.phase4.passed;
    const totalAPIs = testResults.phase3.total + testResults.phase4.total;
    
    log('\n📊 OVERALL RESULTS:', 'cyan');
    log(`Total APIs Tested: ${totalAPIs}`, 'blue');
    log(`Working APIs: ${totalWorking}`, 'green');
    log(`Failed APIs: ${totalAPIs - totalWorking}`, 'red');
    log(`Success Rate: ${Math.round((totalWorking / totalAPIs) * 100)}%`, 'yellow');
    
    if (totalWorking === totalAPIs) {
        log('Status: All Phases 3 & 4 APIs working correctly!', 'green');
    } else {
        log('Status: Some APIs need attention', 'yellow');
    }

    log('\n📄 DELIVERABLES CREATED:', 'cyan');
    log('test-phases-3-4-verification.js - Verification testing script', 'blue');
    log('phases-3-4-verification-results.json - Detailed test results', 'blue');
    
    log('\n🎉 PHASES 3 & 4 VERIFICATION COMPLETED!', 'green');
}

// Run the test
testPhases3And4()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
