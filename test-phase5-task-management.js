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

// Test Phase 5 Task Management APIs
async function testPhase5TaskManagement() {
    log('\n🎯 PHASE 5: TASK MANAGEMENT APIs TESTING', 'cyan');
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

    // Get a project ID for testing
    log('\n📝 Step 3: Get Project ID', 'yellow');
    const getProjectsResult = await testAPI(`/brands/${brandId}/projects`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (!getProjectsResult.success) {
        log(`   ❌ Failed to get projects (${getProjectsResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(getProjectsResult.error)}`, 'red');
        return;
    }
    
    if (!getProjectsResult.data.data.projects || getProjectsResult.data.data.projects.length === 0) {
        log('   ❌ No projects available for testing', 'red');
        return;
    }
    
    const projectId = getProjectsResult.data.data.projects[0].id;
    log(`   ✅ Project ID: ${projectId}`, 'green');

    const testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        details: []
    };

    // Test 1: Get Brand Tasks
    log('\n📝 Step 4: Test Get Brand Tasks', 'yellow');
    testResults.total++;
    log(`   GET /api/brands/${brandId}/tasks`, 'blue');
    
    const getTasksResult = await testAPI(`/brands/${brandId}/tasks`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getTasksResult.success) {
        log('   ✅ SUCCESS (200) - Get brand tasks successful', 'green');
        testResults.passed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get brand tasks successful'
        });
    } else {
        log(`   ❌ FAILED (${getTasksResult.status})`, 'red');
        testResults.failed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks`,
            status: 'FAILED',
            statusCode: getTasksResult.status,
            message: getTasksResult.error?.message || 'Unknown error'
        });
    }

    // Test 2: Create Brand Task
    log('\n📝 Step 5: Test Create Brand Task', 'yellow');
    testResults.total++;
    log(`   POST /api/brands/${brandId}/tasks`, 'blue');
    
    const createTaskData = {
        task: 'Phase 5 Test Task',
        description: 'This is a test task for Phase 5 testing',
        projectId: projectId,
        assignedTo: loginResult.data.user.id,
        reporter: loginResult.data.user.id,
        priority: 'High',
        status: 'Yet to Start',
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const createTaskResult = await testAPI(`/brands/${brandId}/tasks`, 'POST', createTaskData, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    let taskId = null;
    if (createTaskResult.success) {
        log('   ✅ SUCCESS (201) - Create brand task successful', 'green');
        taskId = createTaskResult.data.data.id;
        testResults.passed++;
        testResults.details.push({
            endpoint: `POST /api/brands/${brandId}/tasks`,
            status: 'SUCCESS',
            statusCode: 201,
            message: 'Create brand task successful',
            taskId: taskId
        });
    } else {
        log(`   ❌ FAILED (${createTaskResult.status})`, 'red');
        log(`   Error: ${JSON.stringify(createTaskResult.error)}`, 'red');
        testResults.failed++;
        testResults.details.push({
            endpoint: `POST /api/brands/${brandId}/tasks`,
            status: 'FAILED',
            statusCode: createTaskResult.status,
            message: createTaskResult.error?.message || 'Unknown error'
        });
    }

    // Test 3: Get Brand Task by ID
    if (taskId) {
        log('\n📝 Step 6: Test Get Brand Task by ID', 'yellow');
        testResults.total++;
        log(`   GET /api/brands/${brandId}/tasks/${taskId}`, 'blue');
        
        const getTaskResult = await testAPI(`/brands/${brandId}/tasks/${taskId}`, 'GET', null, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (getTaskResult.success) {
            log('   ✅ SUCCESS (200) - Get brand task by ID successful', 'green');
            testResults.passed++;
            testResults.details.push({
                endpoint: `GET /api/brands/${brandId}/tasks/${taskId}`,
                status: 'SUCCESS',
                statusCode: 200,
                message: 'Get brand task by ID successful'
            });
        } else {
            log(`   ❌ FAILED (${getTaskResult.status})`, 'red');
            testResults.failed++;
            testResults.details.push({
                endpoint: `GET /api/brands/${brandId}/tasks/${taskId}`,
                status: 'FAILED',
                statusCode: getTaskResult.status,
                message: getTaskResult.error?.message || 'Unknown error'
            });
        }
    }

    // Test 4: Update Brand Task
    if (taskId) {
        log('\n📝 Step 7: Test Update Brand Task', 'yellow');
        testResults.total++;
        log(`   PUT /api/brands/${brandId}/tasks/${taskId}`, 'blue');
        
        const updateTaskData = {
            title: 'Updated Phase 5 Test Task',
            description: 'This is an updated test task for Phase 5 testing',
            priority: 'Medium',
            status: 'In Progress'
        };
        
        const updateTaskResult = await testAPI(`/brands/${brandId}/tasks/${taskId}`, 'PUT', updateTaskData, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (updateTaskResult.success) {
            log('   ✅ SUCCESS (200) - Update brand task successful', 'green');
            testResults.passed++;
            testResults.details.push({
                endpoint: `PUT /api/brands/${brandId}/tasks/${taskId}`,
                status: 'SUCCESS',
                statusCode: 200,
                message: 'Update brand task successful'
            });
        } else {
            log(`   ❌ FAILED (${updateTaskResult.status})`, 'red');
            testResults.failed++;
            testResults.details.push({
                endpoint: `PUT /api/brands/${brandId}/tasks/${taskId}`,
                status: 'FAILED',
                statusCode: updateTaskResult.status,
                message: updateTaskResult.error?.message || 'Unknown error'
            });
        }
    }

    // Test 5: Get Project Tasks
    log('\n📝 Step 8: Test Get Project Tasks', 'yellow');
    testResults.total++;
    log(`   GET /api/brands/${brandId}/projects/${projectId}/tasks`, 'blue');
    
    const getProjectTasksResult = await testAPI(`/brands/${brandId}/projects/${projectId}/tasks`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getProjectTasksResult.success) {
        log('   ✅ SUCCESS (200) - Get project tasks successful', 'green');
        testResults.passed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/tasks`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get project tasks successful'
        });
    } else {
        log(`   ❌ FAILED (${getProjectTasksResult.status})`, 'red');
        testResults.failed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/projects/${projectId}/tasks`,
            status: 'FAILED',
            statusCode: getProjectTasksResult.status,
            message: getProjectTasksResult.error?.message || 'Unknown error'
        });
    }

    // Test 6: Assign Task
    if (taskId) {
        log('\n📝 Step 9: Test Assign Task', 'yellow');
        testResults.total++;
        log(`   POST /api/brands/${brandId}/tasks/${taskId}/assign`, 'blue');
        
        const assignTaskData = {
            user_id: loginResult.data.user.id
        };
        
        const assignTaskResult = await testAPI(`/brands/${brandId}/tasks/${taskId}/assign`, 'POST', assignTaskData, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (assignTaskResult.success) {
            log('   ✅ SUCCESS (200) - Assign task successful', 'green');
            testResults.passed++;
            testResults.details.push({
                endpoint: `POST /api/brands/${brandId}/tasks/${taskId}/assign`,
                status: 'SUCCESS',
                statusCode: 200,
                message: 'Assign task successful'
            });
        } else {
            log(`   ❌ FAILED (${assignTaskResult.status})`, 'red');
            testResults.failed++;
            testResults.details.push({
                endpoint: `POST /api/brands/${brandId}/tasks/${taskId}/assign`,
                status: 'FAILED',
                statusCode: assignTaskResult.status,
                message: assignTaskResult.error?.message || 'Unknown error'
            });
        }
    }

    // Test 7: Update Task Status
    if (taskId) {
        log('\n📝 Step 10: Test Update Task Status', 'yellow');
        testResults.total++;
        log(`   PUT /api/brands/${brandId}/tasks/${taskId}/status`, 'blue');
        
        const updateStatusData = {
            status: 'In Progress'
        };
        
        const updateStatusResult = await testAPI(`/brands/${brandId}/tasks/${taskId}/status`, 'PUT', updateStatusData, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (updateStatusResult.success) {
            log('   ✅ SUCCESS (200) - Update task status successful', 'green');
            testResults.passed++;
            testResults.details.push({
                endpoint: `PUT /api/brands/${brandId}/tasks/${taskId}/status`,
                status: 'SUCCESS',
                statusCode: 200,
                message: 'Update task status successful'
            });
        } else {
            log(`   ❌ FAILED (${updateStatusResult.status})`, 'red');
            testResults.failed++;
            testResults.details.push({
                endpoint: `PUT /api/brands/${brandId}/tasks/${taskId}/status`,
                status: 'FAILED',
                statusCode: updateStatusResult.status,
                message: updateStatusResult.error?.message || 'Unknown error'
            });
        }
    }

    // Test 8: Update Task Priority
    if (taskId) {
        log('\n📝 Step 11: Test Update Task Priority', 'yellow');
        testResults.total++;
        log(`   PUT /api/brands/${brandId}/tasks/${taskId}/priority`, 'blue');
        
        const updatePriorityData = {
            priority: 'Low'
        };
        
        const updatePriorityResult = await testAPI(`/brands/${brandId}/tasks/${taskId}/priority`, 'PUT', updatePriorityData, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (updatePriorityResult.success) {
            log('   ✅ SUCCESS (200) - Update task priority successful', 'green');
            testResults.passed++;
            testResults.details.push({
                endpoint: `PUT /api/brands/${brandId}/tasks/${taskId}/priority`,
                status: 'SUCCESS',
                statusCode: 200,
                message: 'Update task priority successful'
            });
        } else {
            log(`   ❌ FAILED (${updatePriorityResult.status})`, 'red');
            testResults.failed++;
            testResults.details.push({
                endpoint: `PUT /api/brands/${brandId}/tasks/${taskId}/priority`,
                status: 'FAILED',
                statusCode: updatePriorityResult.status,
                message: updatePriorityResult.error?.message || 'Unknown error'
            });
        }
    }

    // Test 9: Get Task Analytics
    log('\n📝 Step 12: Test Get Task Analytics', 'yellow');
    testResults.total++;
    log(`   GET /api/brands/${brandId}/tasks/analytics`, 'blue');
    
    const getAnalyticsResult = await testAPI(`/brands/${brandId}/tasks/analytics`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (getAnalyticsResult.success) {
        log('   ✅ SUCCESS (200) - Get task analytics successful', 'green');
        testResults.passed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks/analytics`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Get task analytics successful'
        });
    } else {
        log(`   ❌ FAILED (${getAnalyticsResult.status})`, 'red');
        testResults.failed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks/analytics`,
            status: 'FAILED',
            statusCode: getAnalyticsResult.status,
            message: getAnalyticsResult.error?.message || 'Unknown error'
        });
    }

    // Test 10: Search Tasks
    log('\n📝 Step 13: Test Search Tasks', 'yellow');
    testResults.total++;
    log(`   GET /api/brands/${brandId}/tasks/search?q=Phase`, 'blue');
    
    const searchTasksResult = await testAPI(`/brands/${brandId}/tasks/search?q=Phase`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (searchTasksResult.success) {
        log('   ✅ SUCCESS (200) - Search tasks successful', 'green');
        testResults.passed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks/search`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Search tasks successful'
        });
    } else {
        log(`   ❌ FAILED (${searchTasksResult.status})`, 'red');
        testResults.failed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks/search`,
            status: 'FAILED',
            statusCode: searchTasksResult.status,
            message: searchTasksResult.error?.message || 'Unknown error'
        });
    }

    // Test 11: Filter Tasks
    log('\n📝 Step 14: Test Filter Tasks', 'yellow');
    testResults.total++;
    log(`   GET /api/brands/${brandId}/tasks/filter?status=In Progress`, 'blue');
    
    const filterTasksResult = await testAPI(`/brands/${brandId}/tasks/filter?status=In Progress`, 'GET', null, {
        'Authorization': `Bearer ${adminToken}`
    });
    
    if (filterTasksResult.success) {
        log('   ✅ SUCCESS (200) - Filter tasks successful', 'green');
        testResults.passed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks/filter`,
            status: 'SUCCESS',
            statusCode: 200,
            message: 'Filter tasks successful'
        });
    } else {
        log(`   ❌ FAILED (${filterTasksResult.status})`, 'red');
        testResults.failed++;
        testResults.details.push({
            endpoint: `GET /api/brands/${brandId}/tasks/filter`,
            status: 'FAILED',
            statusCode: filterTasksResult.status,
            message: filterTasksResult.error?.message || 'Unknown error'
        });
    }

    // Test 12: Delete Task
    if (taskId) {
        log('\n📝 Step 15: Test Delete Task', 'yellow');
        testResults.total++;
        log(`   DELETE /api/brands/${brandId}/tasks/${taskId}`, 'blue');
        
        const deleteTaskResult = await testAPI(`/brands/${brandId}/tasks/${taskId}`, 'DELETE', null, {
            'Authorization': `Bearer ${adminToken}`
        });
        
        if (deleteTaskResult.success) {
            log('   ✅ SUCCESS (200) - Delete task successful', 'green');
            testResults.passed++;
            testResults.details.push({
                endpoint: `DELETE /api/brands/${brandId}/tasks/${taskId}`,
                status: 'SUCCESS',
                statusCode: 200,
                message: 'Delete task successful'
            });
        } else {
            log(`   ❌ FAILED (${deleteTaskResult.status})`, 'red');
            testResults.failed++;
            testResults.details.push({
                endpoint: `DELETE /api/brands/${brandId}/tasks/${taskId}`,
                status: 'FAILED',
                statusCode: deleteTaskResult.status,
                message: deleteTaskResult.error?.message || 'Unknown error'
            });
        }
    }

    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('phase5-task-management-results.json', JSON.stringify(testResults, null, 2));

    log('\n📊 PHASE 5 TASK MANAGEMENT TESTING SUMMARY', 'cyan');
    log('============================================================', 'cyan');
    log(`Total APIs Tested: ${testResults.total}`, 'blue');
    log(`Working APIs: ${testResults.passed}`, 'green');
    log(`Failed APIs: ${testResults.failed}`, 'red');
    log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`, 'yellow');
    
    if (testResults.failed === 0) {
        log('Status: All APIs working correctly!', 'green');
    } else {
        log('Status: Some APIs need attention', 'yellow');
    }

    log('\n📄 DELIVERABLES CREATED:', 'cyan');
    log('test-phase5-task-management.js - Complete testing script', 'blue');
    log('phase5-task-management-results.json - Detailed test results', 'blue');
    
    log('\n🎉 PHASE 5 TASK MANAGEMENT TESTING COMPLETED!', 'green');
}

// Run the test
testPhase5TaskManagement()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        log(`\n❌ ERROR: ${error.message}`, 'red');
        process.exit(1);
    });
