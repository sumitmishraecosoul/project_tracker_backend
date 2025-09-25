const axios = require('axios');
const fs = require('fs');

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
    authentication: [],
    brands: [],
    projects: [],
    tasks: [],
    subtasks: [],
    comments: [],
    notifications: [],
    users: [],
    dashboard: [],
    analytics: []
};

let adminToken = null;
let brandId = null;
let projectId = null;
let taskId = null;
let subtaskId = null;
let commentId = null;
let notificationId = null;
let userId = null;

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
        return {
            success: true,
            status: response.status,
            data: response.data,
            endpoint,
            method
        };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status || 500,
            error: error.response?.data || error.message,
            endpoint,
            method
        };
    }
}

// Test Authentication APIs
async function testAuthenticationAPIs() {
    log('\n🔐 TESTING AUTHENTICATION APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const authTests = [
        {
            name: 'Admin Login',
            endpoint: '/auth/login',
            method: 'POST',
            data: {
                email: 'testadmin@example.com',
                password: 'admin123'
            }
        },
        {
            name: 'User Registration',
            endpoint: '/auth/register',
            method: 'POST',
            data: {
                name: 'Test User ' + Date.now(),
                email: `testuser${Date.now()}@example.com`,
                password: 'test123',
                employeeNumber: 'EMP-' + Date.now()
            }
        },
        {
            name: 'User Login',
            endpoint: '/auth/login',
            method: 'POST',
            data: {
                email: 'testuser@example.com',
                password: 'test123'
            }
        }
    ];
    
    for (const test of authTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Admin Login' && result.data.token) {
                adminToken = result.data.token;
                log(`   Token: ${adminToken.substring(0, 20)}...`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.authentication.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Brand APIs
async function testBrandAPIs() {
    log('\n🏢 TESTING BRAND APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const brandTests = [
        {
            name: 'Get All Brands',
            endpoint: '/brands',
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Create Brand',
            endpoint: '/brands',
            method: 'POST',
            data: {
                name: 'Test Brand ' + Date.now(),
                description: 'Test brand for comprehensive testing',
                settings: {
                    theme: 'light',
                    notifications: true
                }
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Brand Details',
            endpoint: `/brands/${brandId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Brand',
            endpoint: `/brands/${brandId}`,
            method: 'PUT',
            data: {
                name: 'Updated Test Brand',
                description: 'Updated description'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Brand Users',
            endpoint: `/brands/${brandId}/users`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of brandTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Get All Brands' && result.data.data && result.data.data.length > 0) {
                brandId = result.data.data[0].id;
                log(`   Brand ID: ${brandId}`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.brands.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Project APIs
async function testProjectAPIs() {
    log('\n📁 TESTING PROJECT APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const projectTests = [
        {
            name: 'Get All Projects',
            endpoint: `/brands/${brandId}/projects`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Create Project',
            endpoint: `/brands/${brandId}/projects`,
            method: 'POST',
            data: {
                title: 'Test Project ' + Date.now(),
                description: 'Test project for comprehensive testing',
                status: 'Active',
                department: 'India E-commerce',
                priority: 'Medium'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Project Details',
            endpoint: `/brands/${brandId}/projects/${projectId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Project',
            endpoint: `/brands/${brandId}/projects/${projectId}`,
            method: 'PUT',
            data: {
                title: 'Updated Test Project',
                description: 'Updated description'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Project Sections',
            endpoint: `/brands/${brandId}/projects/${projectId}/sections`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Project Tasks',
            endpoint: `/brands/${brandId}/projects/${projectId}/tasks`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of projectTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Get All Projects' && result.data.data && result.data.data.length > 0) {
                projectId = result.data.data[0].id;
                log(`   Project ID: ${projectId}`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.projects.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Task APIs
async function testTaskAPIs() {
    log('\n📋 TESTING TASK APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const taskTests = [
        {
            name: 'Get All Tasks',
            endpoint: `/brands/${brandId}/tasks`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Create Task',
            endpoint: `/brands/${brandId}/tasks`,
            method: 'POST',
            data: {
                id: `TASK-${Date.now()}`,
                task: 'Test Task ' + Date.now(),
                description: 'Test task for comprehensive testing',
                status: 'Yet to Start',
                priority: 'Medium',
                taskType: 'Daily',
                assignedTo: userId,
                reporter: userId,
                eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedHours: 8,
                projectId: projectId
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Task Details',
            endpoint: `/brands/${brandId}/tasks/${taskId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Task',
            endpoint: `/brands/${brandId}/tasks/${taskId}`,
            method: 'PUT',
            data: {
                task: 'Updated Test Task',
                description: 'Updated description'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Assign Task',
            endpoint: `/brands/${brandId}/tasks/${taskId}/assign`,
            method: 'POST',
            data: {
                assignedTo: userId
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Task Status',
            endpoint: `/brands/${brandId}/tasks/${taskId}/status`,
            method: 'PUT',
            data: {
                status: 'In Progress'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Task Priority',
            endpoint: `/brands/${brandId}/tasks/${taskId}/priority`,
            method: 'PUT',
            data: {
                priority: 'High'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of taskTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Get All Tasks' && result.data.data && result.data.data.tasks && result.data.data.tasks.length > 0) {
                taskId = result.data.data.tasks[0]._id;
                log(`   Task ID: ${taskId}`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.tasks.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Subtask APIs
async function testSubtaskAPIs() {
    log('\n📝 TESTING SUBTASK APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const subtaskTests = [
        {
            name: 'Get All Subtasks',
            endpoint: `/brands/${brandId}/subtasks`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Create Subtask',
            endpoint: `/brands/${brandId}/subtasks`,
            method: 'POST',
            data: {
                title: 'Test Subtask ' + Date.now(),
                description: 'Test subtask for comprehensive testing',
                status: 'To Do',
                priority: 'Medium',
                assignedTo: userId,
                task_id: taskId,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                estimatedHours: 4
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Subtask Details',
            endpoint: `/brands/${brandId}/subtasks/${subtaskId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Subtask',
            endpoint: `/brands/${brandId}/subtasks/${subtaskId}`,
            method: 'PUT',
            data: {
                title: 'Updated Test Subtask',
                description: 'Updated description'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Assign Subtask',
            endpoint: `/brands/${brandId}/subtasks/${subtaskId}/assign`,
            method: 'POST',
            data: {
                assignedTo: userId
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Subtask Status',
            endpoint: `/brands/${brandId}/subtasks/${subtaskId}/status`,
            method: 'PUT',
            data: {
                status: 'In Progress'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of subtaskTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Get All Subtasks' && result.data.data && result.data.data.length > 0) {
                subtaskId = result.data.data[0]._id;
                log(`   Subtask ID: ${subtaskId}`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.subtasks.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Comment APIs
async function testCommentAPIs() {
    log('\n💬 TESTING COMMENT APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const commentTests = [
        {
            name: 'Get Task Comments',
            endpoint: `/tasks/${taskId}/comments`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Create Comment',
            endpoint: `/tasks/${taskId}/comments`,
            method: 'POST',
            data: {
                content: 'This is a **test comment** with *markdown* support',
                mentions: [{
                    user_id: userId,
                    name: 'Test User',
                    email: 'testuser@example.com'
                }],
                projectId: projectId
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Comment Details',
            endpoint: `/comments/${commentId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Comment',
            endpoint: `/comments/${commentId}`,
            method: 'PUT',
            data: {
                content: 'This is an **updated comment**'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Add Comment Reply',
            endpoint: `/comments/${commentId}/replies`,
            method: 'POST',
            data: {
                content: 'This is a **reply** to the comment'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Add Comment Reaction',
            endpoint: `/comments/${commentId}/reactions`,
            method: 'POST',
            data: {
                emoji: '👍'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Mention Suggestions',
            endpoint: `/brands/${brandId}/mention-suggestions?q=test`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of commentTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Get Task Comments' && result.data.data && result.data.data.length > 0) {
                commentId = result.data.data[0]._id;
                log(`   Comment ID: ${commentId}`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.comments.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Notification APIs
async function testNotificationAPIs() {
    log('\n🔔 TESTING NOTIFICATION APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const notificationTests = [
        {
            name: 'Get All Notifications',
            endpoint: `/brands/${brandId}/notifications`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Create Notification',
            endpoint: `/brands/${brandId}/notifications`,
            method: 'POST',
            data: {
                recipient: userId,
                type: 'task_assigned',
                category: 'task',
                title: 'Test Notification ' + Date.now(),
                message: 'This is a test notification',
                relatedId: taskId,
                relatedModel: 'Task',
                priority: 'medium',
                delivery_methods: ['in_app', 'email']
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Notification Details',
            endpoint: `/brands/${brandId}/notifications/${notificationId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update Notification',
            endpoint: `/brands/${brandId}/notifications/${notificationId}`,
            method: 'PUT',
            data: {
                title: 'Updated Test Notification',
                message: 'Updated message'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Mark Notification as Read',
            endpoint: `/brands/${brandId}/notifications/${notificationId}/read`,
            method: 'PUT',
            data: {
                read: true
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Delete Notification',
            endpoint: `/brands/${brandId}/notifications/${notificationId}`,
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of notificationTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
            if (test.name === 'Get All Notifications' && result.data.data && result.data.data.length > 0) {
                notificationId = result.data.data[0]._id;
                log(`   Notification ID: ${notificationId}`, 'blue');
            }
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.notifications.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test User APIs
async function testUserAPIs() {
    log('\n👥 TESTING USER APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const userTests = [
        {
            name: 'Get All Users',
            endpoint: '/users',
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get User Details',
            endpoint: `/users/${userId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Update User',
            endpoint: `/users/${userId}`,
            method: 'PUT',
            data: {
                name: 'Updated Test User'
            },
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Assignable Users',
            endpoint: '/users/helpers/assignable-users',
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of userTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.users.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Test Dashboard APIs
async function testDashboardAPIs() {
    log('\n📊 TESTING DASHBOARD APIs', 'magenta');
    log('='.repeat(60), 'magenta');
    
    const dashboardTests = [
        {
            name: 'Get Dashboard Stats',
            endpoint: '/dashboard/stats',
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Recent Activities',
            endpoint: '/dashboard/activities',
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        },
        {
            name: 'Get Task Analytics',
            endpoint: '/dashboard/task-analytics',
            method: 'GET',
            headers: { Authorization: `Bearer ${adminToken}` }
        }
    ];
    
    for (const test of dashboardTests) {
        log(`\n📝 Testing: ${test.name}`, 'yellow');
        log(`   ${test.method} ${test.endpoint}`, 'blue');
        
        const result = await testAPI(test.endpoint, test.method, test.data, test.headers);
        
        if (result.success) {
            log(`   ✅ SUCCESS (${result.status})`, 'green');
        } else {
            log(`   ❌ FAILED (${result.status})`, 'red');
            log(`   Error: ${JSON.stringify(result.error)}`, 'red');
        }
        
        testResults.dashboard.push({
            name: test.name,
            endpoint: test.endpoint,
            method: test.method,
            success: result.success,
            status: result.status,
            data: result.data,
            error: result.error
        });
    }
}

// Generate comprehensive report
function generateReport() {
    log('\n📊 GENERATING COMPREHENSIVE API REPORT', 'bright');
    log('='.repeat(60), 'bright');
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalAPIs: 0,
            successfulAPIs: 0,
            failedAPIs: 0,
            successRate: 0
        },
        categories: {}
    };
    
    // Calculate summary
    for (const category in testResults) {
        const tests = testResults[category];
        report.categories[category] = {
            total: tests.length,
            successful: tests.filter(t => t.success).length,
            failed: tests.filter(t => !t.success).length,
            successRate: 0,
            apis: tests
        };
        
        report.categories[category].successRate = 
            (report.categories[category].successful / report.categories[category].total) * 100;
        
        report.summary.totalAPIs += tests.length;
        report.summary.successfulAPIs += tests.filter(t => t.success).length;
        report.summary.failedAPIs += tests.filter(t => !t.success).length;
    }
    
    report.summary.successRate = (report.summary.successfulAPIs / report.summary.totalAPIs) * 100;
    
    // Save report to file
    fs.writeFileSync('comprehensive-api-test-results.json', JSON.stringify(report, null, 2));
    
    // Display summary
    log(`\n📈 API TESTING SUMMARY:`, 'bright');
    log(`Total APIs Tested: ${report.summary.totalAPIs}`, 'blue');
    log(`Successful: ${report.summary.successfulAPIs}`, 'green');
    log(`Failed: ${report.summary.failedAPIs}`, 'red');
    log(`Success Rate: ${report.summary.successRate.toFixed(2)}%`, 'yellow');
    
    // Display category breakdown
    for (const category in report.categories) {
        const cat = report.categories[category];
        log(`\n${category.toUpperCase()}:`, 'cyan');
        log(`  Total: ${cat.total} | Success: ${cat.successful} | Failed: ${cat.failed} | Rate: ${cat.successRate.toFixed(2)}%`, 'blue');
    }
    
    return report;
}

// Main testing function
async function runComprehensiveTesting() {
    log('\n🚀 STARTING COMPREHENSIVE API TESTING', 'bright');
    log('='.repeat(60), 'bright');
    
    try {
        // Test all API categories
        await testAuthenticationAPIs();
        await testBrandAPIs();
        await testProjectAPIs();
        await testTaskAPIs();
        await testSubtaskAPIs();
        await testCommentAPIs();
        await testNotificationAPIs();
        await testUserAPIs();
        await testDashboardAPIs();
        
        // Generate comprehensive report
        const report = generateReport();
        
        log('\n🎉 COMPREHENSIVE API TESTING COMPLETED!', 'green');
        log('📄 Report saved to: comprehensive-api-test-results.json', 'blue');
        
        return report;
        
    } catch (error) {
        log(`\n❌ TESTING FAILED: ${error.message}`, 'red');
        return null;
    }
}

// Run the comprehensive testing
runComprehensiveTesting().then(report => {
    if (report) {
        console.log('\n✅ Comprehensive API testing completed successfully!');
    } else {
        console.log('\n❌ Comprehensive API testing failed!');
    }
}).catch(error => {
    console.error('💥 Fatal error:', error.message);
});
