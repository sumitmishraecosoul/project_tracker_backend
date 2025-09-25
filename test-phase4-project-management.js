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
    phase4: {
        projectManagement: []
    }
};

let adminToken = null;
let brandId = null;
let projectId = null;

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

// Phase 4: Project Management APIs Testing
async function testPhase4ProjectManagement() {
    log('\n📁 PHASE 4: PROJECT MANAGEMENT APIs TESTING', 'cyan');
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
        log('   ❌ Admin login failed', 'red');
        return;
    }

    // Get a brand ID for testing
    log('\n📝 Step 2: Get Brand ID for Testing', 'yellow');
    const getBrandsResult = await testAPI('/brands', 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getBrandsResult.success && getBrandsResult.data.data.length > 0) {
        brandId = getBrandsResult.data.data[0].id;
        log(`   ✅ Brand ID: ${brandId}`, 'green');
    } else {
        log('   ❌ No brands available for testing', 'red');
        return;
    }

    // Test 1: Get Brand Projects
    log('\n📝 Testing: Get Brand Projects', 'yellow');
    log(`   GET /api/brands/${brandId}/projects`, 'blue');
    
    const getProjectsResult = await testAPI(`/brands/${brandId}/projects`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProjectsResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getProjectsResult.data,
            notes: 'Get brand projects successful'
        });
    } else {
        log(`   ❌ FAILED (${getProjectsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getProjectsResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects`,
            status: 'FAILED',
            statusCode: getProjectsResult.status,
            request: null,
            error: getProjectsResult.error,
            notes: 'Get brand projects failed'
        });
    }

    // Test 2: Create Project
    log('\n📝 Testing: Create Project', 'yellow');
    log(`   POST /api/brands/${brandId}/projects`, 'blue');
    
    const createProjectData = {
        name: 'Test Project Phase4',
        description: 'Test project for Phase 4 testing',
        status: 'active',
        priority: 'medium',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        tags: ['test', 'phase4'],
        settings: {
            allowComments: true,
            allowAttachments: true,
            notifications: true
        }
    };
    
    const createProjectResult = await testAPI(`/brands/${brandId}/projects`, 'POST', createProjectData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (createProjectResult.success) {
        log('   ✅ SUCCESS (201)', 'green');
        projectId = createProjectResult.data.data.id;
        log(`   Project ID: ${projectId}`, 'blue');
        testResults.phase4.projectManagement.push({
            endpoint: `POST /api/brands/${brandId}/projects`,
            status: 'SUCCESS',
            statusCode: 201,
            request: createProjectData,
            response: createProjectResult.data,
            notes: 'Create project successful'
        });
    } else {
        log(`   ❌ FAILED (${createProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(createProjectResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `POST /api/brands/${brandId}/projects`,
            status: 'FAILED',
            statusCode: createProjectResult.status,
            request: createProjectData,
            error: createProjectResult.error,
            notes: 'Create project failed'
        });
    }

    // Test 3: Get Project Details
    log('\n📝 Testing: Get Project Details', 'yellow');
    log(`   GET /api/brands/${brandId}/projects/${projectId}`, 'blue');
    
    const getProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProjectResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getProjectResult.data,
            notes: 'Get project details successful'
        });
    } else {
        log(`   ❌ FAILED (${getProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getProjectResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}`,
            status: 'FAILED',
            statusCode: getProjectResult.status,
            request: null,
            error: getProjectResult.error,
            notes: 'Get project details failed'
        });
    }

    // Test 4: Update Project
    log('\n📝 Testing: Update Project', 'yellow');
    log(`   PUT /api/brands/${brandId}/projects/${projectId}`, 'blue');
    
    const updateProjectData = {
        name: 'Updated Test Project Phase4',
        description: 'Updated test project description',
        status: 'active',
        priority: 'high',
        tags: ['test', 'phase4', 'updated']
    };
    
    const updateProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}`, 'PUT', updateProjectData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (updateProjectResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: updateProjectData,
            response: updateProjectResult.data,
            notes: 'Update project successful'
        });
    } else {
        log(`   ❌ FAILED (${updateProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(updateProjectResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}`,
            status: 'FAILED',
            statusCode: updateProjectResult.status,
            request: updateProjectData,
            error: updateProjectResult.error,
            notes: 'Update project failed'
        });
    }

    // Test 5: Get Project Tasks
    log('\n📝 Testing: Get Project Tasks', 'yellow');
    log(`   GET /api/brands/${brandId}/projects/${projectId}/tasks`, 'blue');
    
    const getProjectTasksResult = await testAPI(`/brands/${brandId}/projects/${projectId}/tasks`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProjectTasksResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/tasks`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getProjectTasksResult.data,
            notes: 'Get project tasks successful'
        });
    } else {
        log(`   ❌ FAILED (${getProjectTasksResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getProjectTasksResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/tasks`,
            status: 'FAILED',
            statusCode: getProjectTasksResult.status,
            request: null,
            error: getProjectTasksResult.error,
            notes: 'Get project tasks failed'
        });
    }

    // Test 6: Update Project Status
    log('\n📝 Testing: Update Project Status', 'yellow');
    log(`   PUT /api/brands/${brandId}/projects/${projectId}/status`, 'blue');
    
    const updateStatusData = {
        status: 'in_progress'
    };
    
    const updateStatusResult = await testAPI(`/brands/${brandId}/projects/${projectId}/status`, 'PUT', updateStatusData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (updateStatusResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}/status`,
            status: 'SUCCESS',
            statusCode: 200,
            request: updateStatusData,
            response: updateStatusResult.data,
            notes: 'Update project status successful'
        });
    } else {
        log(`   ❌ FAILED (${updateStatusResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(updateStatusResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}/status`,
            status: 'FAILED',
            statusCode: updateStatusResult.status,
            request: updateStatusData,
            error: updateStatusResult.error,
            notes: 'Update project status failed'
        });
    }

    // Test 7: Complete Project
    log('\n📝 Testing: Complete Project', 'yellow');
    log(`   PUT /api/brands/${brandId}/projects/${projectId}/complete`, 'blue');
    
    const completeProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}/complete`, 'PUT', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (completeProjectResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}/complete`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: completeProjectResult.data,
            notes: 'Complete project successful'
        });
    } else {
        log(`   ❌ FAILED (${completeProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(completeProjectResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}/complete`,
            status: 'FAILED',
            statusCode: completeProjectResult.status,
            request: null,
            error: completeProjectResult.error,
            notes: 'Complete project failed'
        });
    }

    // Test 8: Archive Project
    log('\n📝 Testing: Archive Project', 'yellow');
    log(`   PUT /api/brands/${brandId}/projects/${projectId}/archive`, 'blue');
    
    const archiveProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}/archive`, 'PUT', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (archiveProjectResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}/archive`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: archiveProjectResult.data,
            notes: 'Archive project successful'
        });
    } else {
        log(`   ❌ FAILED (${archiveProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(archiveProjectResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `PUT /api/brands/${brandId}/projects/${projectId}/archive`,
            status: 'FAILED',
            statusCode: archiveProjectResult.status,
            request: null,
            error: archiveProjectResult.error,
            notes: 'Archive project failed'
        });
    }

    // Test 9: Get Project Sections
    log('\n📝 Testing: Get Project Sections', 'yellow');
    log(`   GET /api/brands/${brandId}/projects/${projectId}/sections`, 'blue');
    
    const getSectionsResult = await testAPI(`/brands/${brandId}/projects/${projectId}/sections`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getSectionsResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/sections`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getSectionsResult.data,
            notes: 'Get project sections successful'
        });
    } else {
        log(`   ❌ FAILED (${getSectionsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getSectionsResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/sections`,
            status: 'FAILED',
            statusCode: getSectionsResult.status,
            request: null,
            error: getSectionsResult.error,
            notes: 'Get project sections failed'
        });
    }

    // Test 10: Create Project Section
    log('\n📝 Testing: Create Project Section', 'yellow');
    log(`   POST /api/brands/${brandId}/projects/${projectId}/sections`, 'blue');
    
    const createSectionData = {
        name: 'Test Section Phase4',
        description: 'Test section for Phase 4 testing',
        order: 1
    };
    
    const createSectionResult = await testAPI(`/brands/${brandId}/projects/${projectId}/sections`, 'POST', createSectionData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (createSectionResult.success) {
        log('   ✅ SUCCESS (201)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `POST /api/brands/${brandId}/projects/${projectId}/sections`,
            status: 'SUCCESS',
            statusCode: 201,
            request: createSectionData,
            response: createSectionResult.data,
            notes: 'Create project section successful'
        });
    } else {
        log(`   ❌ FAILED (${createSectionResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(createSectionResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `POST /api/brands/${brandId}/projects/${projectId}/sections`,
            status: 'FAILED',
            statusCode: createSectionResult.status,
            request: createSectionData,
            error: createSectionResult.error,
            notes: 'Create project section failed'
        });
    }

    // Test 11: Get Project Views
    log('\n📝 Testing: Get Project Views', 'yellow');
    log(`   GET /api/brands/${brandId}/projects/${projectId}/views`, 'blue');
    
    const getViewsResult = await testAPI(`/brands/${brandId}/projects/${projectId}/views`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getViewsResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/views`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getViewsResult.data,
            notes: 'Get project views successful'
        });
    } else {
        log(`   ❌ FAILED (${getViewsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getViewsResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/views`,
            status: 'FAILED',
            statusCode: getViewsResult.status,
            request: null,
            error: getViewsResult.error,
            notes: 'Get project views failed'
        });
    }

    // Test 12: Create Project View
    log('\n📝 Testing: Create Project View', 'yellow');
    log(`   POST /api/brands/${brandId}/projects/${projectId}/views`, 'blue');
    
    const createViewData = {
        name: 'Test View Phase4',
        type: 'kanban',
        settings: {
            groupBy: 'status',
            sortBy: 'priority',
            filters: {
                status: ['active', 'in_progress']
            }
        }
    };
    
    const createViewResult = await testAPI(`/brands/${brandId}/projects/${projectId}/views`, 'POST', createViewData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (createViewResult.success) {
        log('   ✅ SUCCESS (201)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `POST /api/brands/${brandId}/projects/${projectId}/views`,
            status: 'SUCCESS',
            statusCode: 201,
            request: createViewData,
            response: createViewResult.data,
            notes: 'Create project view successful'
        });
    } else {
        log(`   ❌ FAILED (${createViewResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(createViewResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `POST /api/brands/${brandId}/projects/${projectId}/views`,
            status: 'FAILED',
            statusCode: createViewResult.status,
            request: createViewData,
            error: createViewResult.error,
            notes: 'Create project view failed'
        });
    }

    // Test 13: Get Project Analytics
    log('\n📝 Testing: Get Project Analytics', 'yellow');
    log(`   GET /api/brands/${brandId}/projects/${projectId}/analytics`, 'blue');
    
    const getAnalyticsResult = await testAPI(`/brands/${brandId}/projects/${projectId}/analytics`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getAnalyticsResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/analytics`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getAnalyticsResult.data,
            notes: 'Get project analytics successful'
        });
    } else {
        log(`   ❌ FAILED (${getAnalyticsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getAnalyticsResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/analytics`,
            status: 'FAILED',
            statusCode: getAnalyticsResult.status,
            request: null,
            error: getAnalyticsResult.error,
            notes: 'Get project analytics failed'
        });
    }

    // Test 14: Get Project Progress
    log('\n📝 Testing: Get Project Progress', 'yellow');
    log(`   GET /api/brands/${brandId}/projects/${projectId}/progress`, 'blue');
    
    const getProgressResult = await testAPI(`/brands/${brandId}/projects/${projectId}/progress`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProgressResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/progress`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: getProgressResult.data,
            notes: 'Get project progress successful'
        });
    } else {
        log(`   ❌ FAILED (${getProgressResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getProgressResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/progress`,
            status: 'FAILED',
            statusCode: getProgressResult.status,
            request: null,
            error: getProgressResult.error,
            notes: 'Get project progress failed'
        });
    }

    // Test 15: Delete Project
    log('\n📝 Testing: Delete Project', 'yellow');
    log(`   DELETE /api/brands/${brandId}/projects/${projectId}`, 'blue');
    
    const deleteProjectResult = await testAPI(`/brands/${brandId}/projects/${projectId}`, 'DELETE', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (deleteProjectResult.success) {
        log('   ✅ SUCCESS (200)', 'green');
        testResults.phase4.projectManagement.push({
            endpoint: `DELETE /api/brands/${brandId}/projects/${projectId}`,
            status: 'SUCCESS',
            statusCode: 200,
            request: null,
            response: deleteProjectResult.data,
            notes: 'Delete project successful'
        });
    } else {
        log(`   ❌ FAILED (${deleteProjectResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(deleteProjectResult.error)}`, 'red');
        testResults.phase4.projectManagement.push({
            endpoint: `DELETE /api/brands/${brandId}/projects/${projectId}`,
            status: 'FAILED',
            statusCode: deleteProjectResult.status,
            request: null,
            error: deleteProjectResult.error,
            notes: 'Delete project failed'
        });
    }

    // Generate Phase 4 Report
    log('\n📊 PHASE 4 PROJECT MANAGEMENT TESTING SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    
    const totalTests = testResults.phase4.projectManagement.length;
    const successfulTests = testResults.phase4.projectManagement.filter(test => test.status === 'SUCCESS').length;
    const failedTests = testResults.phase4.projectManagement.filter(test => test.status === 'FAILED').length;
    
    log(`Total APIs Tested: ${totalTests}`, 'bright');
    log(`Successful: ${successfulTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(2)}%`, 'yellow');
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('phase4-project-management-results.json', JSON.stringify(testResults, null, 2));
    log('\n📄 Results saved to: phase4-project-management-results.json', 'green');
    
    return testResults;
}

// Run the test
testPhase4ProjectManagement()
    .then(results => {
        log('\n🎉 PHASE 4 PROJECT MANAGEMENT TESTING COMPLETED!', 'green');
        log('📄 Results saved to: phase4-project-management-results.json', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
