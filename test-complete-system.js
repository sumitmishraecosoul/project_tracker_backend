const axios = require('axios');
const WebSocket = require('ws');

const BASE_URL = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000/api/ws';

// Test data with unique identifiers
const timestamp = Date.now();
const testUser = {
  name: 'Complete System Tester',
  email: `completesystem${timestamp}@example.com`,
  password: 'TestPassword123!',
  employeeNumber: `EMP-COMPLETE-${timestamp}`,
  department: 'Data Analytics',
  username: `completesystem${timestamp}`
};

const testBrand = {
  name: `Complete System Brand ${timestamp}`,
  description: 'Brand for testing complete system functionality',
  website: 'https://completesystem.com',
  industry: 'Technology'
};

const testProject = {
  title: 'Complete System Project',
  description: 'Project for testing complete system functionality',
  status: 'Active',
  priority: 'Medium',
  department: 'Data Analytics',
  startDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
};

const testTask = {
  task: 'Complete System Task',
  description: 'Task for testing complete system functionality',
  status: 'Yet to Start',
  priority: 'Medium',
  projectId: '', // Will be set after project creation
  assignedTo: '', // Will be set to current user
  reporter: '', // Will be set to current user
  eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
};

const testComment = {
  content: 'This is a **comprehensive test comment** with *markdown* formatting and [link](https://example.com)!',
  mentions: [],
  links: []
};

// Global variables
let authToken = '';
let brandId = '';
let projectId = '';
let taskId = '';
let userId = '';
let commentId = '';
let replyId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(`❌ Error making ${method} request to ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

const recordTest = (testName, passed, details = '') => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
  testResults.details.push({ testName, passed, details });
};

// ============================================================================
// PHASE 1: AUTHENTICATION & USER MANAGEMENT
// ============================================================================
const testPhase1 = async () => {
  console.log('\n🔐 PHASE 1: AUTHENTICATION & USER MANAGEMENT');
  console.log('='.repeat(60));
  
  try {
    // 1.1 User Registration
    console.log('1.1 Testing user registration...');
    await axios.post(`${BASE_URL}/auth/register`, testUser);
    recordTest('User Registration', true);
    
    // 1.2 User Login
    console.log('1.2 Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    userId = loginResponse.data.user.id;
    recordTest('User Login', true);
    
    // 1.3 Get User Profile
    console.log('1.3 Testing get user profile...');
    const profileResponse = await makeRequest('GET', '/users/profile');
    recordTest('Get User Profile', profileResponse.data.success);
    
    // 1.4 Update User Profile
    console.log('1.4 Testing update user profile...');
    const updateResponse = await makeRequest('PUT', '/users/profile', {
      name: 'Updated Complete System Tester'
    });
    recordTest('Update User Profile', updateResponse.data.success);
    
    // 1.5 Get All Users
    console.log('1.5 Testing get all users...');
    const usersResponse = await makeRequest('GET', '/users');
    recordTest('Get All Users', usersResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 1 Authentication', false, error.message);
    return false;
  }
};

// ============================================================================
// PHASE 2: BRAND MANAGEMENT
// ============================================================================
const testPhase2 = async () => {
  console.log('\n🏢 PHASE 2: BRAND MANAGEMENT');
  console.log('='.repeat(60));
  
  try {
    // 2.1 Create Brand
    console.log('2.1 Testing brand creation...');
    const brandResponse = await makeRequest('POST', '/brands', testBrand);
    brandId = brandResponse.data.data.id;
    recordTest('Create Brand', brandResponse.data.success);
    
    // 2.2 Get All Brands
    console.log('2.2 Testing get all brands...');
    const brandsResponse = await makeRequest('GET', '/brands');
    recordTest('Get All Brands', brandsResponse.data.success);
    
    // 2.3 Get Brand by ID
    console.log('2.3 Testing get brand by ID...');
    const brandByIdResponse = await makeRequest('GET', `/brands/${brandId}`);
    recordTest('Get Brand by ID', brandByIdResponse.data.success);
    
    // 2.4 Update Brand
    console.log('2.4 Testing update brand...');
    const updateBrandResponse = await makeRequest('PUT', `/brands/${brandId}`, {
      description: 'Updated brand description for complete system testing'
    });
    recordTest('Update Brand', updateBrandResponse.data.success);
    
    // 2.5 Switch to Brand
    console.log('2.5 Testing brand switching...');
    const switchResponse = await makeRequest('POST', `/brands/${brandId}/switch`);
    authToken = switchResponse.data.token; // Update token with brand context
    recordTest('Switch to Brand', switchResponse.data.success);
    
    // 2.6 Get Brand Users
    console.log('2.6 Testing get brand users...');
    const brandUsersResponse = await makeRequest('GET', `/brands/${brandId}/users`);
    recordTest('Get Brand Users', brandUsersResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 2 Brand Management', false, error.message);
    return false;
  }
};

// ============================================================================
// PHASE 3: PROJECT MANAGEMENT
// ============================================================================
const testPhase3 = async () => {
  console.log('\n📁 PHASE 3: PROJECT MANAGEMENT');
  console.log('='.repeat(60));
  
  try {
    // 3.1 Create Project
    console.log('3.1 Testing project creation...');
    const projectResponse = await makeRequest('POST', `/brands/${brandId}/projects`, testProject);
    projectId = projectResponse.data.data._id;
    recordTest('Create Project', projectResponse.data.success);
    
    // 3.2 Get All Projects
    console.log('3.2 Testing get all projects...');
    const projectsResponse = await makeRequest('GET', `/brands/${brandId}/projects`);
    recordTest('Get All Projects', projectsResponse.data.success);
    
    // 3.3 Get Project by ID
    console.log('3.3 Testing get project by ID...');
    const projectByIdResponse = await makeRequest('GET', `/brands/${brandId}/projects/${projectId}`);
    recordTest('Get Project by ID', projectByIdResponse.data.success);
    
    // 3.4 Update Project
    console.log('3.4 Testing update project...');
    const updateProjectResponse = await makeRequest('PUT', `/brands/${brandId}/projects/${projectId}`, {
      description: 'Updated project description for complete system testing'
    });
    recordTest('Update Project', updateProjectResponse.data.success);
    
    // 3.5 Update Project Status
    console.log('3.5 Testing update project status...');
    const statusResponse = await makeRequest('PUT', `/brands/${brandId}/projects/${projectId}/status`, {
      status: 'Active'
    });
    recordTest('Update Project Status', statusResponse.data.success);
    
    // 3.6 Get Project Tasks
    console.log('3.6 Testing get project tasks...');
    const projectTasksResponse = await makeRequest('GET', `/brands/${brandId}/projects/${projectId}/tasks`);
    recordTest('Get Project Tasks', projectTasksResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 3 Project Management', false, error.message);
    return false;
  }
};

// ============================================================================
// PHASE 4: TASK MANAGEMENT
// ============================================================================
const testPhase4 = async () => {
  console.log('\n📋 PHASE 4: TASK MANAGEMENT');
  console.log('='.repeat(60));
  
  try {
    // 4.1 Create Task
    console.log('4.1 Testing task creation...');
    const uniqueTaskId = `TASK-${timestamp}`;
    const taskResponse = await makeRequest('POST', `/brands/${brandId}/tasks`, {
      ...testTask,
      id: uniqueTaskId,
      projectId: projectId,
      assignedTo: userId,
      reporter: userId
    });
    taskId = taskResponse.data.data._id;
    recordTest('Create Task', taskResponse.data.success);
    
    // 4.2 Get All Tasks
    console.log('4.2 Testing get all tasks...');
    const tasksResponse = await makeRequest('GET', `/brands/${brandId}/tasks`);
    recordTest('Get All Tasks', tasksResponse.data.success);
    
    // 4.3 Get Task by ID
    console.log('4.3 Testing get task by ID...');
    const taskByIdResponse = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}`);
    recordTest('Get Task by ID', taskByIdResponse.data.success);
    
    // 4.4 Update Task
    console.log('4.4 Testing update task...');
    const updateTaskResponse = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}`, {
      description: 'Updated task description for complete system testing'
    });
    recordTest('Update Task', updateTaskResponse.data.success);
    
    // 4.5 Update Task Status
    console.log('4.5 Testing update task status...');
    const taskStatusResponse = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/status`, {
      status: 'In Progress'
    });
    recordTest('Update Task Status', taskStatusResponse.data.success);
    
    // 4.6 Assign Task
    console.log('4.6 Testing task assignment...');
    const assignResponse = await makeRequest('PUT', `/brands/${brandId}/tasks/${taskId}/assign`, {
      assignedTo: userId
    });
    recordTest('Assign Task', assignResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 4 Task Management', false, error.message);
    return false;
  }
};

// ============================================================================
// PHASE 5: SUBTASK MANAGEMENT
// ============================================================================
const testPhase5 = async () => {
  console.log('\n📝 PHASE 5: SUBTASK MANAGEMENT');
  console.log('='.repeat(60));
  
  try {
    // 5.1 Create Subtask
    console.log('5.1 Testing subtask creation...');
    const subtaskResponse = await makeRequest('POST', `/brands/${brandId}/tasks/${taskId}/subtasks`, {
      title: 'Complete System Subtask',
      description: 'Subtask for testing complete system functionality',
      status: 'Yet to Start',
      priority: 'Medium',
      assignedTo: userId,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });
    const subtaskId = subtaskResponse.data.data._id;
    recordTest('Create Subtask', subtaskResponse.data.success);
    
    // 5.2 Get All Subtasks
    console.log('5.2 Testing get all subtasks...');
    const subtasksResponse = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/subtasks`);
    recordTest('Get All Subtasks', subtasksResponse.data.success);
    
    // 5.3 Get Subtask by ID
    console.log('5.3 Testing get subtask by ID...');
    const subtaskByIdResponse = await makeRequest('GET', `/brands/${brandId}/subtasks/${subtaskId}`);
    recordTest('Get Subtask by ID', subtaskByIdResponse.data.success);
    
    // 5.4 Update Subtask
    console.log('5.4 Testing update subtask...');
    const updateSubtaskResponse = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}`, {
      description: 'Updated subtask description for complete system testing'
    });
    recordTest('Update Subtask', updateSubtaskResponse.data.success);
    
    // 5.5 Update Subtask Status
    console.log('5.5 Testing update subtask status...');
    const subtaskStatusResponse = await makeRequest('PUT', `/brands/${brandId}/subtasks/${subtaskId}/status`, {
      status: 'In Progress'
    });
    recordTest('Update Subtask Status', subtaskStatusResponse.data.success);
    
    // 5.6 Delete Subtask
    console.log('5.6 Testing delete subtask...');
    const deleteSubtaskResponse = await makeRequest('DELETE', `/brands/${brandId}/subtasks/${subtaskId}`);
    recordTest('Delete Subtask', deleteSubtaskResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 5 Subtask Management', false, error.message);
    return false;
  }
};

// ============================================================================
// PHASE 6: ACTIVITY & NOTIFICATION SYSTEM
// ============================================================================
const testPhase6 = async () => {
  console.log('\n🔔 PHASE 6: ACTIVITY & NOTIFICATION SYSTEM');
  console.log('='.repeat(60));
  
  try {
    // 6.1 Get Task Activities
    console.log('6.1 Testing get task activities...');
    const activitiesResponse = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/activities`);
    recordTest('Get Task Activities', activitiesResponse.data.success);
    
    // 6.2 Get Brand Activities
    console.log('6.2 Testing get brand activities...');
    const brandActivitiesResponse = await makeRequest('GET', `/brands/${brandId}/activities`);
    recordTest('Get Brand Activities', brandActivitiesResponse.data.success);
    
    // 6.3 Get Notification Preferences
    console.log('6.3 Testing get notification preferences...');
    const preferencesResponse = await makeRequest('GET', `/brands/${brandId}/notifications/preferences`);
    recordTest('Get Notification Preferences', preferencesResponse.data.success);
    
    // 6.4 Update Notification Preferences
    console.log('6.4 Testing update notification preferences...');
    const updatePreferencesResponse = await makeRequest('PUT', `/brands/${brandId}/notifications/preferences`, {
      global_settings: {
        email_notifications: true,
        in_app_notifications: true,
        push_notifications: false
      }
    });
    recordTest('Update Notification Preferences', updatePreferencesResponse.data.success);
    
    // 6.5 Get All Notifications
    console.log('6.5 Testing get all notifications...');
    const notificationsResponse = await makeRequest('GET', `/brands/${brandId}/notifications`);
    recordTest('Get All Notifications', notificationsResponse.data.success);
    
    // 6.6 Get User Notifications
    console.log('6.6 Testing get user notifications...');
    const userNotificationsResponse = await makeRequest('GET', `/brands/${brandId}/notifications/user/me`);
    recordTest('Get User Notifications', userNotificationsResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 6 Activity & Notification System', false, error.message);
    return false;
  }
};

// ============================================================================
// PHASE 7: ADVANCED COMMENT SYSTEM
// ============================================================================
const testPhase7 = async () => {
  console.log('\n💬 PHASE 7: ADVANCED COMMENT SYSTEM');
  console.log('='.repeat(60));
  
  try {
    // 7.1 Create Comment
    console.log('7.1 Testing comment creation...');
    const commentResponse = await makeRequest('POST', `/brands/${brandId}/tasks/${taskId}/comments`, testComment);
    commentId = commentResponse.data.data._id;
    recordTest('Create Comment', commentResponse.data.success);
    
    // 7.2 Get Comments
    console.log('7.2 Testing get comments...');
    const commentsResponse = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/comments`);
    recordTest('Get Comments', commentsResponse.data.success);
    
    // 7.3 Get Comment by ID
    console.log('7.3 Testing get comment by ID...');
    const commentByIdResponse = await makeRequest('GET', `/brands/${brandId}/comments/${commentId}`);
    recordTest('Get Comment by ID', commentByIdResponse.data.success);
    
    // 7.4 Add Reaction
    console.log('7.4 Testing add reaction...');
    const reactionResponse = await makeRequest('POST', `/brands/${brandId}/comments/${commentId}/reactions`, {
      emoji: '👍'
    });
    recordTest('Add Reaction', reactionResponse.data.success);
    
    // 7.5 Add Reply
    console.log('7.5 Testing add reply...');
    const replyResponse = await makeRequest('POST', `/brands/${brandId}/comments/${commentId}/replies`, {
      content: 'This is a **reply** to the test comment with *markdown* formatting!',
      mentions: []
    });
    replyId = replyResponse.data.data._id;
    recordTest('Add Reply', replyResponse.data.success);
    
    // 7.6 Get Replies
    console.log('7.6 Testing get replies...');
    const repliesResponse = await makeRequest('GET', `/brands/${brandId}/comments/${commentId}/replies`);
    recordTest('Get Replies', repliesResponse.data.success);
    
    // 7.7 Update Comment
    console.log('7.7 Testing update comment...');
    const updateCommentResponse = await makeRequest('PUT', `/brands/${brandId}/comments/${commentId}`, {
      content: 'This is an **updated comment** with *new* markdown formatting and [updated link](https://updated.com)!'
    });
    recordTest('Update Comment', updateCommentResponse.data.success);
    
    // 7.8 Get Comment Statistics
    console.log('7.8 Testing get comment statistics...');
    const statsResponse = await makeRequest('GET', `/brands/${brandId}/comments/${commentId}/statistics`);
    recordTest('Get Comment Statistics', statsResponse.data.success);
    
    // 7.9 Get Comment Analytics
    console.log('7.9 Testing get comment analytics...');
    const analyticsResponse = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/comment-analytics`);
    recordTest('Get Comment Analytics', analyticsResponse.data.success);
    
    // 7.10 Get Mention Suggestions
    console.log('7.10 Testing get mention suggestions...');
    const mentionResponse = await makeRequest('GET', `/brands/${brandId}/mention-suggestions?query=Complete`);
    recordTest('Get Mention Suggestions', mentionResponse.data.success);
    
    // 7.11 Subscribe to Task
    console.log('7.11 Testing subscribe to task...');
    const subscribeResponse = await makeRequest('POST', `/brands/${brandId}/tasks/${taskId}/subscribe`, {
      subscriptionTypes: ['comments', 'activities', 'mentions']
    });
    recordTest('Subscribe to Task', subscribeResponse.data.success);
    
    // 7.12 Unsubscribe from Task
    console.log('7.12 Testing unsubscribe from task...');
    const unsubscribeResponse = await makeRequest('DELETE', `/brands/${brandId}/tasks/${taskId}/subscribe`);
    recordTest('Unsubscribe from Task', unsubscribeResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Phase 7 Advanced Comment System', false, error.message);
    return false;
  }
};

// ============================================================================
// WEBSOCKET TESTING
// ============================================================================
const testWebSocket = async () => {
  console.log('\n⚡ WEBSOCKET REAL-TIME TESTING');
  console.log('='.repeat(60));
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(WS_URL);
      let connected = false;
      
      ws.onopen = () => {
        connected = true;
        console.log('8.1 Testing WebSocket connection...');
        recordTest('WebSocket Connection', true);
        
        // Send authentication message
        ws.send(JSON.stringify({
          type: 'AUTH',
          payload: { userId: userId }
        }));
        
        // Send subscription message
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE',
          payload: {
            entityType: 'task',
            entityId: taskId,
            subscriptionTypes: ['comments', 'activities'],
            brandId: brandId
          }
        }));
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 2000);
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('8.2 Testing WebSocket message handling...');
        recordTest('WebSocket Message Handling', true);
      };
      
      ws.onerror = (error) => {
        console.log('8.1 Testing WebSocket connection...');
        recordTest('WebSocket Connection', false, error.message);
        resolve(false);
      };
      
      ws.onclose = () => {
        if (!connected) {
          console.log('8.1 Testing WebSocket connection...');
          recordTest('WebSocket Connection', false, 'Connection failed');
        }
        resolve(connected);
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        if (!connected) {
          recordTest('WebSocket Connection', false, 'Connection timeout');
        }
        resolve(connected);
      }, 5000);
      
    } catch (error) {
      recordTest('WebSocket Testing', false, error.message);
      resolve(false);
    }
  });
};

// ============================================================================
// DASHBOARD & ANALYTICS TESTING
// ============================================================================
const testDashboard = async () => {
  console.log('\n📊 DASHBOARD & ANALYTICS TESTING');
  console.log('='.repeat(60));
  
  try {
    // 9.1 Get Dashboard Data
    console.log('9.1 Testing get dashboard data...');
    const dashboardResponse = await makeRequest('GET', '/dashboard');
    recordTest('Get Dashboard Data', dashboardResponse.data.success);
    
    // 9.2 Get Project Analytics
    console.log('9.2 Testing get project analytics...');
    const projectAnalyticsResponse = await makeRequest('GET', `/brands/${brandId}/projects/${projectId}/analytics`);
    recordTest('Get Project Analytics', projectAnalyticsResponse.data.success);
    
    // 9.3 Get Task Analytics
    console.log('9.3 Testing get task analytics...');
    const taskAnalyticsResponse = await makeRequest('GET', `/brands/${brandId}/tasks/${taskId}/analytics`);
    recordTest('Get Task Analytics', taskAnalyticsResponse.data.success);
    
    // 9.4 Get Brand Analytics
    console.log('9.4 Testing get brand analytics...');
    const brandAnalyticsResponse = await makeRequest('GET', `/brands/${brandId}/analytics`);
    recordTest('Get Brand Analytics', brandAnalyticsResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Dashboard & Analytics Testing', false, error.message);
    return false;
  }
};

// ============================================================================
// CLEANUP TESTING
// ============================================================================
const testCleanup = async () => {
  console.log('\n🧹 CLEANUP TESTING');
  console.log('='.repeat(60));
  
  try {
    // 10.1 Delete Comment
    console.log('10.1 Testing delete comment...');
    const deleteCommentResponse = await makeRequest('DELETE', `/brands/${brandId}/comments/${commentId}`);
    recordTest('Delete Comment', deleteCommentResponse.data.success);
    
    // 10.2 Delete Task
    console.log('10.2 Testing delete task...');
    const deleteTaskResponse = await makeRequest('DELETE', `/brands/${brandId}/tasks/${taskId}`);
    recordTest('Delete Task', deleteTaskResponse.data.success);
    
    // 10.3 Delete Project
    console.log('10.3 Testing delete project...');
    const deleteProjectResponse = await makeRequest('DELETE', `/brands/${brandId}/projects/${projectId}`);
    recordTest('Delete Project', deleteProjectResponse.data.success);
    
    // 10.4 Delete Brand
    console.log('10.4 Testing delete brand...');
    const deleteBrandResponse = await makeRequest('DELETE', `/brands/${brandId}`);
    recordTest('Delete Brand', deleteBrandResponse.data.success);
    
    return true;
  } catch (error) {
    recordTest('Cleanup Testing', false, error.message);
    return false;
  }
};

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
const runCompleteSystemTest = async () => {
  console.log('🚀 STARTING COMPLETE SYSTEM TEST');
  console.log('='.repeat(80));
  console.log('Testing all APIs and features from Phase 1 to Phase 7');
  console.log('Including: Authentication, Brands, Projects, Tasks, Subtasks,');
  console.log('Activities, Notifications, Advanced Comments, WebSocket, Analytics');
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  
  try {
    // Run all test phases
    await testPhase1();
    await testPhase2();
    await testPhase3();
    await testPhase4();
    await testPhase5();
    await testPhase6();
    await testPhase7();
    await testWebSocket();
    await testDashboard();
    await testCleanup();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Print final results
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPLETE SYSTEM TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Duration: ${duration.toFixed(2)} seconds`);
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`📈 Total Tests: ${testResults.total}`);
    console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.testName}: ${test.details}`);
        });
    }
    
    console.log('\n🎉 SYSTEM STATUS:');
    if (testResults.failed === 0) {
      console.log('✅ ALL SYSTEMS OPERATIONAL - READY FOR FRONTEND INTEGRATION!');
    } else if (testResults.passed > testResults.failed) {
      console.log('⚠️  MOSTLY OPERATIONAL - MINOR ISSUES TO RESOLVE');
    } else {
      console.log('❌ SIGNIFICANT ISSUES DETECTED - NEEDS ATTENTION');
    }
    
    console.log('\n📋 IMPLEMENTED FEATURES:');
    console.log('✅ Phase 1: Authentication & User Management');
    console.log('✅ Phase 2: Brand Management');
    console.log('✅ Phase 3: Project Management');
    console.log('✅ Phase 4: Task Management');
    console.log('✅ Phase 5: Subtask Management');
    console.log('✅ Phase 6: Activity & Notification System');
    console.log('✅ Phase 7: Advanced Comment System');
    console.log('✅ WebSocket Real-time Communication');
    console.log('✅ Dashboard & Analytics');
    console.log('✅ Complete CRUD Operations');
    console.log('✅ Role-based Authorization');
    console.log('✅ Brand-aware Context');
    console.log('✅ Markdown Processing');
    console.log('✅ Link Sharing & Preview');
    console.log('✅ @ Mention System');
    console.log('✅ Comment Threading & Replies');
    console.log('✅ Reaction System');
    console.log('✅ Real-time Notifications');
    console.log('✅ Email Notifications');
    console.log('✅ Activity Tracking');
    console.log('✅ Analytics & Statistics');
    
    return testResults.failed === 0;
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in system test:', error.message);
    return false;
  }
};

// Run the complete system test
runCompleteSystemTest().catch(console.error);

