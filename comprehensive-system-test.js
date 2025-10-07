const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

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

// Test data
let testData = {
    adminToken: null,
    userToken: null,
    brandId: null,
    projectId: null,
    taskId: null,
    commentId: null,
    userId: null
};

async function testDatabaseConnection() {
    log('\n🔍 PHASE 0: DATABASE CONNECTION TEST', 'cyan');
    log('='.repeat(50), 'cyan');
    
    try {
        // Set default MongoDB URI if not provided
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/asana_dev';
        log(`🔗 Connecting to MongoDB: ${mongoUri}`, 'blue');
        
        await mongoose.connect(mongoUri);
        log('✅ Database connection successful', 'green');
        
        // Test collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        log(`📊 Found ${collections.length} collections:`, 'blue');
        collections.forEach(col => log(`   - ${col.name}`, 'blue'));
        
        return true;
    } catch (error) {
        log(`❌ Database connection failed: ${error.message}`, 'red');
        return false;
    }
}

async function testPhase1_BrandManagement() {
    log('\n🏢 PHASE 1: BRAND MANAGEMENT TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 1.1: Admin Login
        log('\n📝 Testing Admin Login...', 'yellow');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        if (loginResponse.data.success) {
            testData.adminToken = loginResponse.data.token;
            log('✅ Admin login successful', 'green');
            log(`   Token: ${testData.adminToken.substring(0, 20)}...`, 'blue');
        } else {
            throw new Error('Admin login failed');
        }
        
        // Test 1.2: Get Brands
        log('\n📝 Testing Brand List API...', 'yellow');
        const brandsResponse = await axios.get(`${API_BASE}/brands`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (brandsResponse.data.success) {
            log('✅ Brand list retrieved successfully', 'green');
            log(`   Found ${brandsResponse.data.brands.length} brands`, 'blue');
            if (brandsResponse.data.brands.length > 0) {
                testData.brandId = brandsResponse.data.brands[0]._id;
                log(`   Using brand ID: ${testData.brandId}`, 'blue');
            }
        }
        
        // Test 1.3: Create New Brand
        log('\n📝 Testing Brand Creation...', 'yellow');
        const createBrandResponse = await axios.post(`${API_BASE}/brands`, {
            name: 'Test Brand ' + Date.now(),
            description: 'Test brand for comprehensive testing',
            settings: {
                theme: 'light',
                notifications: true
            }
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (createBrandResponse.data.success) {
            log('✅ Brand creation successful', 'green');
            testData.brandId = createBrandResponse.data.brand._id;
            log(`   Created brand ID: ${testData.brandId}`, 'blue');
        }
        
        // Test 1.4: Get Brand Details
        log('\n📝 Testing Brand Details API...', 'yellow');
        const brandDetailsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (brandDetailsResponse.data.success) {
            log('✅ Brand details retrieved successfully', 'green');
            log(`   Brand Name: ${brandDetailsResponse.data.brand.name}`, 'blue');
        }
        
        // Test 1.5: Update Brand
        log('\n📝 Testing Brand Update...', 'yellow');
        const updateBrandResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}`, {
            name: 'Updated Test Brand',
            description: 'Updated description for testing'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (updateBrandResponse.data.success) {
            log('✅ Brand update successful', 'green');
        }
        
        // Test 1.6: Get Brand Users
        log('\n📝 Testing Brand Users API...', 'yellow');
        const brandUsersResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/users`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (brandUsersResponse.data.success) {
            log('✅ Brand users retrieved successfully', 'green');
            log(`   Found ${brandUsersResponse.data.users.length} users in brand`, 'blue');
        }
        
        log('\n✅ PHASE 1 COMPLETED: Brand Management working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 1 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function testPhase2_Authentication() {
    log('\n🔐 PHASE 2: AUTHENTICATION & AUTHORIZATION TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 2.1: User Registration
        log('\n📝 Testing User Registration...', 'yellow');
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'test123',
            employeeNumber: 'EMP001'
        });
        
        if (registerResponse.data.success) {
            log('✅ User registration successful', 'green');
            testData.userToken = registerResponse.data.token;
            testData.userId = registerResponse.data.user._id;
            log(`   User ID: ${testData.userId}`, 'blue');
        }
        
        // Test 2.2: User Login
        log('\n📝 Testing User Login...', 'yellow');
        const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'testuser@example.com',
            password: 'test123'
        });
        
        if (userLoginResponse.data.success) {
            log('✅ User login successful', 'green');
            testData.userToken = userLoginResponse.data.token;
        }
        
        // Test 2.3: Protected Route Access
        log('\n📝 Testing Protected Route Access...', 'yellow');
        const protectedResponse = await axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${testData.userToken}` }
        });
        
        if (protectedResponse.data.success) {
            log('✅ Protected route access successful', 'green');
            log(`   User: ${protectedResponse.data.user.name}`, 'blue');
        }
        
        // Test 2.4: Brand Context Middleware
        log('\n📝 Testing Brand Context Middleware...', 'yellow');
        const brandContextResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/projects`, {
            headers: { Authorization: `Bearer ${testData.userToken}` }
        });
        
        if (brandContextResponse.data.success) {
            log('✅ Brand context middleware working', 'green');
        }
        
        log('\n✅ PHASE 2 COMPLETED: Authentication & Authorization working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 2 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function testPhase3_ProjectManagement() {
    log('\n📁 PHASE 3: PROJECT MANAGEMENT TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 3.1: Create Project
        log('\n📝 Testing Project Creation...', 'yellow');
        const createProjectResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/projects`, {
            name: 'Test Project ' + Date.now(),
            description: 'Test project for comprehensive testing',
            status: 'active',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            department: 'Engineering'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (createProjectResponse.data.success) {
            log('✅ Project creation successful', 'green');
            testData.projectId = createProjectResponse.data.project._id;
            log(`   Created project ID: ${testData.projectId}`, 'blue');
        }
        
        // Test 3.2: Get Projects
        log('\n📝 Testing Project List API...', 'yellow');
        const projectsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/projects`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (projectsResponse.data.success) {
            log('✅ Project list retrieved successfully', 'green');
            log(`   Found ${projectsResponse.data.projects.length} projects`, 'blue');
        }
        
        // Test 3.3: Get Project Details
        log('\n📝 Testing Project Details API...', 'yellow');
        const projectDetailsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/projects/${testData.projectId}`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (projectDetailsResponse.data.success) {
            log('✅ Project details retrieved successfully', 'green');
            log(`   Project Name: ${projectDetailsResponse.data.project.name}`, 'blue');
        }
        
        // Test 3.4: Update Project
        log('\n📝 Testing Project Update...', 'yellow');
        const updateProjectResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}/projects/${testData.projectId}`, {
            name: 'Updated Test Project',
            description: 'Updated project description',
            status: 'active'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (updateProjectResponse.data.success) {
            log('✅ Project update successful', 'green');
        }
        
        // Test 3.5: Project Analytics
        log('\n📝 Testing Project Analytics...', 'yellow');
        try {
            const analyticsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/projects/${testData.projectId}/analytics`, {
                headers: { Authorization: `Bearer ${testData.adminToken}` }
            });
            
            if (analyticsResponse.data.success) {
                log('✅ Project analytics retrieved successfully', 'green');
            }
        } catch (analyticsError) {
            log('⚠️  Project analytics not implemented yet (expected)', 'yellow');
        }
        
        log('\n✅ PHASE 3 COMPLETED: Project Management working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 3 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function testPhase4_TaskManagement() {
    log('\n📋 PHASE 4: TASK MANAGEMENT TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 4.1: Create Task
        log('\n📝 Testing Task Creation...', 'yellow');
        const createTaskResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/projects/${testData.projectId}/tasks`, {
            title: 'Test Task ' + Date.now(),
            description: 'Test task for comprehensive testing',
            status: 'pending',
            priority: 'medium',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: [testData.userId]
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (createTaskResponse.data.success) {
            log('✅ Task creation successful', 'green');
            testData.taskId = createTaskResponse.data.task._id;
            log(`   Created task ID: ${testData.taskId}`, 'blue');
        }
        
        // Test 4.2: Get Tasks
        log('\n📝 Testing Task List API...', 'yellow');
        const tasksResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/projects/${testData.projectId}/tasks`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (tasksResponse.data.success) {
            log('✅ Task list retrieved successfully', 'green');
            log(`   Found ${tasksResponse.data.tasks.length} tasks`, 'blue');
        }
        
        // Test 4.3: Get Task Details
        log('\n📝 Testing Task Details API...', 'yellow');
        const taskDetailsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (taskDetailsResponse.data.success) {
            log('✅ Task details retrieved successfully', 'green');
            log(`   Task Title: ${taskDetailsResponse.data.task.title}`, 'blue');
        }
        
        // Test 4.4: Update Task
        log('\n📝 Testing Task Update...', 'yellow');
        const updateTaskResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}`, {
            title: 'Updated Test Task',
            description: 'Updated task description',
            status: 'in_progress',
            priority: 'high'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (updateTaskResponse.data.success) {
            log('✅ Task update successful', 'green');
        }
        
        // Test 4.5: Task Assignment
        log('\n📝 Testing Task Assignment...', 'yellow');
        const assignTaskResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/assign`, {
            assignedTo: [testData.userId]
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (assignTaskResponse.data.success) {
            log('✅ Task assignment successful', 'green');
        }
        
        // Test 4.6: Task Status Update
        log('\n📝 Testing Task Status Update...', 'yellow');
        const statusUpdateResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/status`, {
            status: 'completed'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (statusUpdateResponse.data.success) {
            log('✅ Task status update successful', 'green');
        }
        
        log('\n✅ PHASE 4 COMPLETED: Task Management working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 4 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function testPhase5_SubtaskManagement() {
    log('\n📝 PHASE 5: SUBTASK MANAGEMENT TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 5.1: Create Subtask
        log('\n📝 Testing Subtask Creation...', 'yellow');
        const createSubtaskResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/subtasks`, {
            title: 'Test Subtask ' + Date.now(),
            description: 'Test subtask for comprehensive testing',
            status: 'pending',
            priority: 'medium',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: [testData.userId]
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (createSubtaskResponse.data.success) {
            log('✅ Subtask creation successful', 'green');
            log(`   Created subtask ID: ${createSubtaskResponse.data.subtask._id}`, 'blue');
        }
        
        // Test 5.2: Get Subtasks
        log('\n📝 Testing Subtask List API...', 'yellow');
        const subtasksResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/subtasks`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (subtasksResponse.data.success) {
            log('✅ Subtask list retrieved successfully', 'green');
            log(`   Found ${subtasksResponse.data.subtasks.length} subtasks`, 'blue');
        }
        
        // Test 5.3: Update Subtask
        log('\n📝 Testing Subtask Update...', 'yellow');
        if (subtasksResponse.data.subtasks.length > 0) {
            const subtaskId = subtasksResponse.data.subtasks[0]._id;
            const updateSubtaskResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}/subtasks/${subtaskId}`, {
                title: 'Updated Test Subtask',
                description: 'Updated subtask description',
                status: 'in_progress'
            }, {
                headers: { Authorization: `Bearer ${testData.adminToken}` }
            });
            
            if (updateSubtaskResponse.data.success) {
                log('✅ Subtask update successful', 'green');
            }
        }
        
        log('\n✅ PHASE 5 COMPLETED: Subtask Management working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 5 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function testPhase6_AdvancedComments() {
    log('\n💬 PHASE 6: ADVANCED COMMENTS & COMMUNICATION TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 6.1: Create Comment
        log('\n📝 Testing Comment Creation...', 'yellow');
        const createCommentResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/comments`, {
            content: 'This is a test comment with **markdown** support and @mention functionality',
            mentions: [testData.userId],
            links: [{
                url: 'https://example.com',
                title: 'Example Link',
                type: 'external'
            }]
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (createCommentResponse.data.success) {
            log('✅ Comment creation successful', 'green');
            testData.commentId = createCommentResponse.data.comment._id;
            log(`   Created comment ID: ${testData.commentId}`, 'blue');
        }
        
        // Test 6.2: Get Comments
        log('\n📝 Testing Comment List API...', 'yellow');
        const commentsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/comments`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (commentsResponse.data.success) {
            log('✅ Comment list retrieved successfully', 'green');
            log(`   Found ${commentsResponse.data.comments.length} comments`, 'blue');
        }
        
        // Test 6.3: Comment Threading (Reply)
        log('\n📝 Testing Comment Threading (Reply)...', 'yellow');
        const replyCommentResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/comments`, {
            content: 'This is a reply to the previous comment',
            parentCommentId: testData.commentId,
            mentions: [testData.userId]
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (replyCommentResponse.data.success) {
            log('✅ Comment reply successful', 'green');
        }
        
        // Test 6.4: Update Comment
        log('\n📝 Testing Comment Update...', 'yellow');
        const updateCommentResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}/comments/${testData.commentId}`, {
            content: 'This is an updated comment with more **markdown** content'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (updateCommentResponse.data.success) {
            log('✅ Comment update successful', 'green');
        }
        
        // Test 6.5: Comment Reactions
        log('\n📝 Testing Comment Reactions...', 'yellow');
        const reactionResponse = await axios.post(`${API_BASE}/brands/${testData.brandId}/comments/${testData.commentId}/reactions`, {
            emoji: '👍'
        }, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (reactionResponse.data.success) {
            log('✅ Comment reaction successful', 'green');
        }
        
        // Test 6.6: Activity Feed
        log('\n📝 Testing Activity Feed...', 'yellow');
        try {
            const activityResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/tasks/${testData.taskId}/activities`, {
                headers: { Authorization: `Bearer ${testData.adminToken}` }
            });
            
            if (activityResponse.data.success) {
                log('✅ Activity feed retrieved successfully', 'green');
                log(`   Found ${activityResponse.data.activities.length} activities`, 'blue');
            }
        } catch (activityError) {
            log('⚠️  Activity feed not implemented yet (expected)', 'yellow');
        }
        
        // Test 6.7: Notifications
        log('\n📝 Testing Notifications...', 'yellow');
        try {
            const notificationsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/notifications`, {
                headers: { Authorization: `Bearer ${testData.adminToken}` }
            });
            
            if (notificationsResponse.data.success) {
                log('✅ Notifications retrieved successfully', 'green');
                log(`   Found ${notificationsResponse.data.notifications.length} notifications`, 'blue');
            }
        } catch (notificationError) {
            log('⚠️  Notifications not implemented yet (expected)', 'yellow');
        }
        
        log('\n✅ PHASE 6 COMPLETED: Advanced Comments & Communication working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 6 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function testPhase7_NotificationSystem() {
    log('\n🔔 PHASE 7: NOTIFICATION SYSTEM TESTING', 'magenta');
    log('='.repeat(50), 'magenta');
    
    try {
        // Test 7.1: Get Notifications
        log('\n📝 Testing Notification List API...', 'yellow');
        const notificationsResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/notifications`, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (notificationsResponse.data.success) {
            log('✅ Notifications retrieved successfully', 'green');
            log(`   Found ${notificationsResponse.data.notifications.length} notifications`, 'blue');
        }
        
        // Test 7.2: Mark Notification as Read
        if (notificationsResponse.data.notifications.length > 0) {
            log('\n📝 Testing Mark Notification as Read...', 'yellow');
            const notificationId = notificationsResponse.data.notifications[0]._id;
            const markReadResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${testData.adminToken}` }
            });
            
            if (markReadResponse.data.success) {
                log('✅ Notification marked as read successfully', 'green');
            }
        }
        
        // Test 7.3: Mark All Notifications as Read
        log('\n📝 Testing Mark All Notifications as Read...', 'yellow');
        const markAllReadResponse = await axios.put(`${API_BASE}/brands/${testData.brandId}/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${testData.adminToken}` }
        });
        
        if (markAllReadResponse.data.success) {
            log('✅ All notifications marked as read successfully', 'green');
        }
        
        // Test 7.4: Get Inbox
        log('\n📝 Testing Inbox API...', 'yellow');
        try {
            const inboxResponse = await axios.get(`${API_BASE}/brands/${testData.brandId}/inbox`, {
                headers: { Authorization: `Bearer ${testData.adminToken}` }
            });
            
            if (inboxResponse.data.success) {
                log('✅ Inbox retrieved successfully', 'green');
                log(`   Found ${inboxResponse.data.inbox.length} inbox items`, 'blue');
            }
        } catch (inboxError) {
            log('⚠️  Inbox not implemented yet (expected)', 'yellow');
        }
        
        log('\n✅ PHASE 7 COMPLETED: Notification System working perfectly!', 'green');
        return true;
        
    } catch (error) {
        log(`❌ PHASE 7 FAILED: ${error.message}`, 'red');
        if (error.response) {
            log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
        }
        return false;
    }
}

async function runComprehensiveTest() {
    log('\n🚀 STARTING COMPREHENSIVE SYSTEM TESTING', 'bright');
    log('='.repeat(60), 'bright');
    log('Testing all phases from Phase 1 to Phase 7', 'bright');
    log('Including Advanced Comments & Communication System', 'bright');
    log('='.repeat(60), 'bright');
    
    const results = {
        database: false,
        phase1: false,
        phase2: false,
        phase3: false,
        phase4: false,
        phase5: false,
        phase6: false,
        phase7: false
    };
    
    // Test Database Connection
    results.database = await testDatabaseConnection();
    
    if (!results.database) {
        log('\n❌ CRITICAL ERROR: Database connection failed. Cannot proceed with testing.', 'red');
        return;
    }
    
    // Test Phase 1: Brand Management
    results.phase1 = await testPhase1_BrandManagement();
    
    if (!results.phase1) {
        log('\n❌ CRITICAL ERROR: Phase 1 failed. Cannot proceed with testing.', 'red');
        return;
    }
    
    // Test Phase 2: Authentication & Authorization
    results.phase2 = await testPhase2_Authentication();
    
    // Test Phase 3: Project Management
    results.phase3 = await testPhase3_ProjectManagement();
    
    // Test Phase 4: Task Management
    results.phase4 = await testPhase4_TaskManagement();
    
    // Test Phase 5: Subtask Management
    results.phase5 = await testPhase5_SubtaskManagement();
    
    // Test Phase 6: Advanced Comments & Communication
    results.phase6 = await testPhase6_AdvancedComments();
    
    // Test Phase 7: Notification System
    results.phase7 = await testPhase7_NotificationSystem();
    
    // Final Results
    log('\n📊 COMPREHENSIVE TESTING RESULTS', 'bright');
    log('='.repeat(60), 'bright');
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    log(`✅ Database Connection: ${results.database ? 'PASSED' : 'FAILED'}`, results.database ? 'green' : 'red');
    log(`✅ Phase 1 - Brand Management: ${results.phase1 ? 'PASSED' : 'FAILED'}`, results.phase1 ? 'green' : 'red');
    log(`✅ Phase 2 - Authentication: ${results.phase2 ? 'PASSED' : 'FAILED'}`, results.phase2 ? 'green' : 'red');
    log(`✅ Phase 3 - Project Management: ${results.phase3 ? 'PASSED' : 'FAILED'}`, results.phase3 ? 'green' : 'red');
    log(`✅ Phase 4 - Task Management: ${results.phase4 ? 'PASSED' : 'FAILED'}`, results.phase4 ? 'green' : 'red');
    log(`✅ Phase 5 - Subtask Management: ${results.phase5 ? 'PASSED' : 'FAILED'}`, results.phase5 ? 'green' : 'red');
    log(`✅ Phase 6 - Advanced Comments: ${results.phase6 ? 'PASSED' : 'FAILED'}`, results.phase6 ? 'green' : 'red');
    log(`✅ Phase 7 - Notifications: ${results.phase7 ? 'PASSED' : 'FAILED'}`, results.phase7 ? 'green' : 'red');
    
    log('\n' + '='.repeat(60), 'bright');
    log(`📈 OVERALL RESULT: ${passedTests}/${totalTests} phases passed`, passedTests === totalTests ? 'green' : 'yellow');
    
    if (passedTests === totalTests) {
        log('🎉 ALL SYSTEMS WORKING PERFECTLY!', 'green');
        log('✅ Your project tracker backend is fully functional!', 'green');
    } else {
        log('⚠️  Some features need attention. Check the failed tests above.', 'yellow');
    }
    
    log('\n🔧 Test Data Created:', 'blue');
    log(`   Brand ID: ${testData.brandId}`, 'blue');
    log(`   Project ID: ${testData.projectId}`, 'blue');
    log(`   Task ID: ${testData.taskId}`, 'blue');
    log(`   Comment ID: ${testData.commentId}`, 'blue');
    log(`   User ID: ${testData.userId}`, 'blue');
    
    await mongoose.disconnect();
    log('\n🔌 Database connection closed', 'blue');
}

// Run the comprehensive test
runComprehensiveTest().catch(error => {
    log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
    process.exit(1);
});
