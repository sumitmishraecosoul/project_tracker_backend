const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  admin: {
    name: 'Notification Test Admin',
    email: `notificationtestadmin${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP${Date.now()}`
  },
  user1: {
    name: 'Notification Test User 1',
    email: `notificationtestuser1${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP1${Date.now()}`
  },
  user2: {
    name: 'Notification Test User 2',
    email: `notificationtestuser2${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP2${Date.now()}`
  },
  brand: {
    name: `Notification Test Brand ${Date.now()}`,
    description: 'Test brand for notification flow testing',
    industry: 'Technology',
    website: 'https://test.com'
  },
  project: {
    title: 'Notification Test Project',
    description: 'Test project for notification testing',
    department: 'Data Analytics',
    priority: 'High',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  task: {
    task: 'Notification Test Task',
    description: 'Test task for notification testing',
    taskType: 'Daily',
    priority: 'High',
    status: 'Yet to Start',
    estimatedHours: 8,
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
};

let adminToken = '';
let user1Token = '';
let user2Token = '';
let brandId = '';
let projectId = '';
let taskId = '';
let adminUserId = '';
let user1Id = '';
let user2Id = '';

// Helper function to make API calls
const apiCall = async (method, url, data = null, headers = {}, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(`API Call failed: ${method} ${url}`);
    console.log(`Error:`, error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Test functions
const testServerHealth = async () => {
  console.log('🔍 Testing Server Health...');
  const result = await apiCall('GET', '/health');
  if (result.success) {
    console.log('✅ Server is running');
    return true;
  } else {
    console.log('❌ Server health check failed:', result.error);
    return false;
  }
};

const testAdminRegistration = async () => {
  console.log('🔍 Testing Admin Registration...');
  const result = await apiCall('POST', '/auth/register', testConfig.admin);
  
  if (result.success) {
    adminToken = result.data.token;
    adminUserId = result.data.user._id;
    console.log('✅ Admin registration successful');
    console.log(`   Admin ID: ${adminUserId}`);
    return true;
  } else {
    console.log('❌ Admin registration failed:', result.error);
    return false;
  }
};

const testUser1Registration = async () => {
  console.log('🔍 Testing User 1 Registration...');
  const result = await apiCall('POST', '/auth/register', testConfig.user1);
  
  if (result.success) {
    user1Token = result.data.token;
    user1Id = result.data.user._id;
    console.log('✅ User 1 registration successful');
    console.log(`   User 1 ID: ${user1Id}`);
    return true;
  } else {
    console.log('❌ User 1 registration failed:', result.error);
    return false;
  }
};

const testUser2Registration = async () => {
  console.log('🔍 Testing User 2 Registration...');
  const result = await apiCall('POST', '/auth/register', testConfig.user2);
  
  if (result.success) {
    user2Token = result.data.token;
    user2Id = result.data.user._id;
    console.log('✅ User 2 registration successful');
    console.log(`   User 2 ID: ${user2Id}`);
    return true;
  } else {
    console.log('❌ User 2 registration failed:', result.error);
    return false;
  }
};

const testBrandCreation = async () => {
  console.log('🔍 Testing Brand Creation...');
  const result = await apiCall('POST', '/brands', testConfig.brand, {}, adminToken);
  
  if (result.success) {
    brandId = result.data.data.id;
    console.log('✅ Brand created successfully');
    console.log(`   Brand ID: ${brandId}`);
    return true;
  } else {
    console.log('❌ Brand creation failed:', result.error);
    return false;
  }
};

const testInviteUser1 = async () => {
  console.log('🔍 Testing Invite User 1 to Brand...');
  const result = await apiCall('POST', `/brands/${brandId}/users/invite`, {
    email: testConfig.user1.email,
    role: 'member'
  }, {}, adminToken);
  
  if (result.success) {
    console.log('✅ User 1 invited successfully');
    return true;
  } else {
    console.log('❌ User 1 invitation failed:', result.error);
    return false;
  }
};

const testUser1AcceptInvitation = async () => {
  console.log('🔍 Testing User 1 Accept Invitation...');
  const result = await apiCall('POST', `/brands/${brandId}/users/accept`, null, {}, user1Token);
  
  if (result.success) {
    console.log('✅ User 1 accepted invitation successfully');
    return true;
  } else {
    console.log('❌ User 1 accept invitation failed:', result.error);
    return false;
  }
};

const testProjectCreation = async () => {
  console.log('🔍 Testing Project Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/projects`, testConfig.project, {}, adminToken);
  
  if (result.success) {
    projectId = result.data.data._id;
    console.log('✅ Project created successfully');
    console.log(`   Project ID: ${projectId}`);
    return true;
  } else {
    console.log('❌ Project creation failed:', result.error);
    return false;
  }
};

const testAddUser1ToProject = async () => {
  console.log('🔍 Testing Add User 1 to Project...');
  const result = await apiCall('POST', `/brands/${brandId}/projects/${projectId}/team-members`, {
    userId: user1Id,
    role: 'member'
  }, {}, adminToken);
  
  if (result.success) {
    console.log('✅ User 1 added to project successfully');
    return true;
  } else {
    console.log('❌ Add User 1 to project failed:', result.error);
    return false;
  }
};

const testTaskCreation = async () => {
  console.log('🔍 Testing Task Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/projects/${projectId}/tasks`, {
    ...testConfig.task,
    assignedTo: user1Id,
    reporter: adminUserId
  }, {}, adminToken);
  
  if (result.success) {
    taskId = result.data.data._id;
    console.log('✅ Task created successfully');
    console.log(`   Task ID: ${taskId}`);
    return true;
  } else {
    console.log('❌ Task creation failed:', result.error);
    return false;
  }
};

const testCreateCommentWithMention = async () => {
  console.log('🔍 Testing Create Comment with Mention...');
  const result = await apiCall('POST', `/brands/${brandId}/tasks/${taskId}/comments`, {
    content: `Hey @${testConfig.user1.name}, can you please review this task?`,
    mentions: [user1Id]
  }, {}, adminToken);
  
  if (result.success) {
    console.log('✅ Comment with mention created successfully');
    return true;
  } else {
    console.log('❌ Comment creation failed:', result.error);
    return false;
  }
};

const testGetUser1Notifications = async () => {
  console.log('🔍 Testing Get User 1 Notifications...');
  const result = await apiCall('GET', `/brands/${brandId}/notifications/user/me`, null, {}, user1Token);
  
  if (result.success) {
    const notifications = result.data.data.notifications;
    console.log('✅ User 1 notifications retrieved successfully');
    console.log(`   Found ${notifications.length} notifications`);
    
    notifications.forEach((notification, index) => {
      console.log(`   Notification ${index + 1}:`);
      console.log(`   - Type: ${notification.type}`);
      console.log(`   - Title: ${notification.title}`);
      console.log(`   - Message: ${notification.message}`);
      console.log(`   - Status: ${notification.status}`);
      console.log(`   - Created: ${notification.created_at}`);
    });
    
    return true;
  } else {
    console.log('❌ Get User 1 notifications failed:', result.error);
    return false;
  }
};

const testGetAllNotifications = async () => {
  console.log('🔍 Testing Get All Notifications...');
  const result = await apiCall('GET', `/brands/${brandId}/notifications`, null, {}, adminToken);
  
  if (result.success) {
    const notifications = result.data.data.notifications;
    console.log('✅ All notifications retrieved successfully');
    console.log(`   Found ${notifications.length} notifications`);
    return true;
  } else {
    console.log('❌ Get all notifications failed:', result.error);
    return false;
  }
};

const testMarkNotificationAsRead = async () => {
  console.log('🔍 Testing Mark Notification as Read...');
  
  // First get notifications
  const getResult = await apiCall('GET', `/brands/${brandId}/notifications/user/me`, null, {}, user1Token);
  
  if (getResult.success && getResult.data.data.notifications.length > 0) {
    const notificationId = getResult.data.data.notifications[0]._id;
    
    const result = await apiCall('PUT', `/brands/${brandId}/notifications/${notificationId}/read`, null, {}, user1Token);
    
    if (result.success) {
      console.log('✅ Notification marked as read successfully');
      return true;
    } else {
      console.log('❌ Mark notification as read failed:', result.error);
      return false;
    }
  } else {
    console.log('❌ No notifications found to mark as read');
    return false;
  }
};

const testMarkAllNotificationsAsRead = async () => {
  console.log('🔍 Testing Mark All Notifications as Read...');
  const result = await apiCall('PUT', `/brands/${brandId}/notifications/read-all`, null, {}, user1Token);
  
  if (result.success) {
    console.log('✅ All notifications marked as read successfully');
    return true;
  } else {
    console.log('❌ Mark all notifications as read failed:', result.error);
    return false;
  }
};

const testCreateNotification = async () => {
  console.log('🔍 Testing Create Notification...');
  const result = await apiCall('POST', `/brands/${brandId}/notifications`, {
    recipient: user1Id,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task',
    priority: 'high'
  }, {}, adminToken);
  
  if (result.success) {
    console.log('✅ Notification created successfully');
    return true;
  } else {
    console.log('❌ Create notification failed:', result.error);
    return false;
  }
};

// Main test runner
const runCompleteNotificationFlowTests = async () => {
  console.log('🚀 Starting Complete Notification Flow Testing...');
  console.log('====================================================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Registration', fn: testAdminRegistration },
    { name: 'User 1 Registration', fn: testUser1Registration },
    { name: 'User 2 Registration', fn: testUser2Registration },
    { name: 'Brand Creation', fn: testBrandCreation },
    { name: 'Invite User 1', fn: testInviteUser1 },
    { name: 'User 1 Accept Invitation', fn: testUser1AcceptInvitation },
    { name: 'Project Creation', fn: testProjectCreation },
    { name: 'Add User 1 to Project', fn: testAddUser1ToProject },
    { name: 'Task Creation', fn: testTaskCreation },
    { name: 'Create Comment with Mention', fn: testCreateCommentWithMention },
    { name: 'Get User 1 Notifications', fn: testGetUser1Notifications },
    { name: 'Get All Notifications', fn: testGetAllNotifications },
    { name: 'Mark Notification as Read', fn: testMarkNotificationAsRead },
    { name: 'Mark All Notifications as Read', fn: testMarkAllNotificationsAsRead },
    { name: 'Create Notification', fn: testCreateNotification }
  ];
  
  for (const test of tests) {
    totalTests++;
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
    }
  }
  
  console.log('\n📊 COMPLETE NOTIFICATION FLOW TEST RESULTS:');
  console.log('============================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Complete Notification Flow is working perfectly!');
    console.log('🚀 All notification APIs are ready for frontend implementation!');
    console.log('\n📋 VERIFIED FEATURES:');
    console.log('✅ User registration and authentication');
    console.log('✅ Brand creation and user invitation');
    console.log('✅ Project creation and team management');
    console.log('✅ Task creation and assignment');
    console.log('✅ Comment creation with mentions');
    console.log('✅ Notification retrieval');
    console.log('✅ Mark as read functionality');
    console.log('✅ Mark all as read functionality');
    console.log('✅ Notification creation');
    console.log('✅ Complete notification system');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
    console.log('🔧 Fix the failed tests before implementing in frontend.');
  }
  
  return passedTests === totalTests;
};

// Run the tests
runCompleteNotificationFlowTests().catch(console.error);
