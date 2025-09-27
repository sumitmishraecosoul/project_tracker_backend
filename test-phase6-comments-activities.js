const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let brandId = '';
let projectId = '';
let taskId = '';
let subtaskId = '';
let commentId = '';
let activityId = '';
let userId = '';

// Test configuration
const testConfig = {
  admin: {
    name: 'Phase6 Admin',
    email: 'phase6admin@test.com',
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: 'EMP001'
  },
  brand: {
    name: `Phase6 Test Brand ${Date.now()}`,
    description: 'Test brand for Phase 6 testing',
    industry: 'Technology',
    website: 'https://test.com'
  },
  project: {
    title: 'Phase 6 Test Project',
    description: 'Test project for Phase 6 testing',
    department: 'Data Analytics',
    priority: 'High',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  task: {
    task: 'Phase 6 Test Task',
    description: 'Test task for Phase 6 testing',
    taskType: 'Daily',
    priority: 'High',
    status: 'Yet to Start',
    estimatedHours: 8,
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  subtask: {
    title: 'Phase 6 Test Subtask',
    description: 'Test subtask for Phase 6 testing',
    status: 'To Do',
    priority: 'Medium',
    estimatedHours: 4,
    eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }
};

// Helper function to make API calls
const apiCall = async (method, url, data = null, headers = {}) => {
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
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
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

const testAdminLogin = async () => {
  console.log('🔍 Testing Admin Login...');
  
  // First try to login
  let result = await apiCall('POST', '/auth/login', {
    email: testConfig.admin.email,
    password: testConfig.admin.password
  });
  
  if (result.success) {
    authToken = result.data.token;
    userId = result.data.user._id;
    console.log('✅ Admin login successful');
    return true;
  }
  
  // If login fails, try to register
  console.log('🔍 Admin not found, creating admin...');
  result = await apiCall('POST', '/auth/register', testConfig.admin);
  
  if (result.success) {
    authToken = result.data.token;
    userId = result.data.user._id;
    console.log('✅ Admin registration successful');
    return true;
  } else {
    console.log('❌ Admin registration failed:', result.error);
    return false;
  }
};

const testBrandCreation = async () => {
  console.log('🔍 Testing Brand Creation...');
  const result = await apiCall('POST', '/brands', testConfig.brand);
  
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

const testProjectCreation = async () => {
  console.log('🔍 Testing Project Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/projects`, testConfig.project);
  
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

const testTaskCreation = async () => {
  console.log('🔍 Testing Task Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/projects/${projectId}/tasks`, {
    ...testConfig.task,
    assignedTo: userId,
    reporter: userId
  });
  
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

const testSubtaskCreation = async () => {
  console.log('🔍 Testing Subtask Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/tasks/${taskId}/subtasks`, {
    ...testConfig.subtask,
    task_id: taskId,
    assignedTo: userId,
    reporter: userId
  });
  
  if (result.success) {
    subtaskId = result.data.data._id;
    console.log('✅ Subtask created successfully');
    console.log(`   Subtask ID: ${subtaskId}`);
    return true;
  } else {
    console.log('❌ Subtask creation failed:', result.error);
    return false;
  }
};

// Comment System Tests
const testCommentCreation = async () => {
  console.log('🔍 Testing Comment Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/task/${taskId}/comments`, {
    content: 'This is a test comment for Phase 6 testing',
    mentions: [userId]
  });
  
  if (result.success) {
    commentId = result.data.data._id;
    console.log('✅ Comment created successfully');
    console.log(`   Comment ID: ${commentId}`);
    return true;
  } else {
    console.log('❌ Comment creation failed:', result.error);
    return false;
  }
};

const testCommentRetrieval = async () => {
  console.log('🔍 Testing Comment Retrieval...');
  const result = await apiCall('GET', `/brands/${brandId}/comments/${commentId}`);
  
  if (result.success) {
    console.log('✅ Comment retrieved successfully');
    return true;
  } else {
    console.log('❌ Comment retrieval failed:', result.error);
    return false;
  }
};

const testCommentUpdate = async () => {
  console.log('🔍 Testing Comment Update...');
  const result = await apiCall('PUT', `/brands/${brandId}/comments/${commentId}`, {
    content: 'This is an updated test comment for Phase 6 testing'
  });
  
  if (result.success) {
    console.log('✅ Comment updated successfully');
    return true;
  } else {
    console.log('❌ Comment update failed:', result.error);
    return false;
  }
};

const testCommentReaction = async () => {
  console.log('🔍 Testing Comment Reaction...');
  const result = await apiCall('POST', `/brands/${brandId}/comments/${commentId}/react`, {
    emoji: '👍'
  });
  
  if (result.success) {
    console.log('✅ Comment reaction added successfully');
    return true;
  } else {
    console.log('❌ Comment reaction failed:', result.error);
    return false;
  }
};

const testCommentReply = async () => {
  console.log('🔍 Testing Comment Reply...');
  const result = await apiCall('POST', `/brands/${brandId}/comments/${commentId}/reply`, {
    content: 'This is a reply to the test comment',
    mentions: [userId]
  });
  
  if (result.success) {
    console.log('✅ Comment reply created successfully');
    return true;
  } else {
    console.log('❌ Comment reply failed:', result.error);
    return false;
  }
};

const testCommentSearch = async () => {
  console.log('🔍 Testing Comment Search...');
  const result = await apiCall('GET', `/brands/${brandId}/comments/search?q=test`);
  
  if (result.success) {
    console.log('✅ Comment search successful');
    return true;
  } else {
    console.log('❌ Comment search failed:', result.error);
    return false;
  }
};

const testCommentAnalytics = async () => {
  console.log('🔍 Testing Comment Analytics...');
  const result = await apiCall('GET', `/brands/${brandId}/comments/analytics`);
  
  if (result.success) {
    console.log('✅ Comment analytics retrieved successfully');
    return true;
  } else {
    console.log('❌ Comment analytics failed:', result.error);
    return false;
  }
};

// Activity System Tests
const testActivityCreation = async () => {
  console.log('🔍 Testing Activity Creation...');
  const result = await apiCall('POST', `/brands/${brandId}/activities`, {
    type: 'task_created',
    title: 'Test Task Created',
    description: 'A test task was created for Phase 6 testing',
    metadata: {
      entity_type: 'task',
      entity_id: taskId,
      entity_title: 'Phase 6 Test Task',
      old_values: null,
      new_values: { task: testConfig.task.task },
      additional_data: { task_id: taskId }
    },
    recipients: [{
      user: userId,
      role: 'primary'
    }],
    priority: 'medium',
    visibility: 'public',
    tags: ['test', 'phase6'],
    mentions: [userId]
  });
  
  if (result.success) {
    activityId = result.data.data._id;
    console.log('✅ Activity created successfully');
    console.log(`   Activity ID: ${activityId}`);
    return true;
  } else {
    console.log('❌ Activity creation failed:', result.error);
    return false;
  }
};

const testActivityRetrieval = async () => {
  console.log('🔍 Testing Activity Retrieval...');
  const result = await apiCall('GET', `/brands/${brandId}/activities/${activityId}`);
  
  if (result.success) {
    console.log('✅ Activity retrieved successfully');
    return true;
  } else {
    console.log('❌ Activity retrieval failed:', result.error);
    return false;
  }
};

const testActivityFeed = async () => {
  console.log('🔍 Testing Activity Feed...');
  const result = await apiCall('GET', `/brands/${brandId}/activities/feed`);
  
  if (result.success) {
    console.log('✅ Activity feed retrieved successfully');
    return true;
  } else {
    console.log('❌ Activity feed failed:', result.error);
    return false;
  }
};

const testActivityUpdate = async () => {
  console.log('🔍 Testing Activity Update...');
  const result = await apiCall('PUT', `/brands/${brandId}/activities/${activityId}`, {
    title: 'Updated Test Task Created',
    description: 'An updated test task was created for Phase 6 testing',
    priority: 'high'
  });
  
  if (result.success) {
    console.log('✅ Activity updated successfully');
    return true;
  } else {
    console.log('❌ Activity update failed:', result.error);
    return false;
  }
};

const testActivityReaction = async () => {
  console.log('🔍 Testing Activity Reaction...');
  const result = await apiCall('POST', `/brands/${brandId}/activities/${activityId}/react`, {
    emoji: '🎉'
  });
  
  if (result.success) {
    console.log('✅ Activity reaction added successfully');
    return true;
  } else {
    console.log('❌ Activity reaction failed:', result.error);
    return false;
  }
};

const testActivitySearch = async () => {
  console.log('🔍 Testing Activity Search...');
  const result = await apiCall('GET', `/brands/${brandId}/activities/search?q=test`);
  
  if (result.success) {
    console.log('✅ Activity search successful');
    return true;
  } else {
    console.log('❌ Activity search failed:', result.error);
    return false;
  }
};

const testActivityAnalytics = async () => {
  console.log('🔍 Testing Activity Analytics...');
  const result = await apiCall('GET', `/brands/${brandId}/activities/analytics`);
  
  if (result.success) {
    console.log('✅ Activity analytics retrieved successfully');
    return true;
  } else {
    console.log('❌ Activity analytics failed:', result.error);
    return false;
  }
};

const testNotifications = async () => {
  console.log('🔍 Testing Notifications...');
  const result = await apiCall('GET', `/brands/${brandId}/activities/notifications`);
  
  if (result.success) {
    console.log('✅ Notifications retrieved successfully');
    return true;
  } else {
    console.log('❌ Notifications failed:', result.error);
    return false;
  }
};

const testActivityPreferences = async () => {
  console.log('🔍 Testing Activity Preferences...');
  const result = await apiCall('GET', `/brands/${brandId}/activities/preferences`);
  
  if (result.success) {
    console.log('✅ Activity preferences retrieved successfully');
    return true;
  } else {
    console.log('❌ Activity preferences failed:', result.error);
    return false;
  }
};

const testCommentDeletion = async () => {
  console.log('🔍 Testing Comment Deletion...');
  const result = await apiCall('DELETE', `/brands/${brandId}/comments/${commentId}`);
  
  if (result.success) {
    console.log('✅ Comment deleted successfully');
    return true;
  } else {
    console.log('❌ Comment deletion failed:', result.error);
    return false;
  }
};

const testActivityDeletion = async () => {
  console.log('🔍 Testing Activity Deletion...');
  const result = await apiCall('DELETE', `/brands/${brandId}/activities/${activityId}`);
  
  if (result.success) {
    console.log('✅ Activity deleted successfully');
    return true;
  } else {
    console.log('❌ Activity deletion failed:', result.error);
    return false;
  }
};

// Edge Cases Tests
const testEdgeCases = async () => {
  console.log('🔍 Testing Edge Cases...');
  
  // Test comment with empty content
  const emptyCommentResult = await apiCall('POST', `/brands/${brandId}/task/${taskId}/comments`, {
    content: '',
    mentions: [userId]
  });
  
  if (!emptyCommentResult.success) {
    console.log('✅ Empty comment validation working');
  } else {
    console.log('❌ Empty comment validation failed');
  }
  
  // Test comment with very long content
  const longContent = 'a'.repeat(5001);
  const longCommentResult = await apiCall('POST', `/brands/${brandId}/task/${taskId}/comments`, {
    content: longContent,
    mentions: [userId]
  });
  
  if (!longCommentResult.success) {
    console.log('✅ Long comment validation working');
  } else {
    console.log('❌ Long comment validation failed');
  }
  
  // Test activity with invalid type
  const invalidActivityResult = await apiCall('POST', `/brands/${brandId}/activities`, {
    type: 'invalid_type',
    title: 'Test Activity',
    description: 'Test description'
  });
  
  if (!invalidActivityResult.success) {
    console.log('✅ Invalid activity type validation working');
  } else {
    console.log('❌ Invalid activity type validation failed');
  }
  
  // Test activity with missing required fields
  const missingFieldsResult = await apiCall('POST', `/brands/${brandId}/activities`, {
    type: 'task_created'
    // Missing title and description
  });
  
  if (!missingFieldsResult.success) {
    console.log('✅ Missing fields validation working');
  } else {
    console.log('❌ Missing fields validation failed');
  }
  
  console.log('✅ Edge cases testing completed');
  return true;
};

// Main test runner
const runPhase6Tests = async () => {
  console.log('🚀 Starting Phase 6: Comments & Communication System Testing...');
  console.log('====================================================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Brand Creation', fn: testBrandCreation },
    { name: 'Project Creation', fn: testProjectCreation },
    { name: 'Task Creation', fn: testTaskCreation },
    { name: 'Subtask Creation', fn: testSubtaskCreation },
    { name: 'Comment Creation', fn: testCommentCreation },
    { name: 'Comment Retrieval', fn: testCommentRetrieval },
    { name: 'Comment Update', fn: testCommentUpdate },
    { name: 'Comment Reaction', fn: testCommentReaction },
    { name: 'Comment Reply', fn: testCommentReply },
    { name: 'Comment Search', fn: testCommentSearch },
    { name: 'Comment Analytics', fn: testCommentAnalytics },
    { name: 'Activity Creation', fn: testActivityCreation },
    { name: 'Activity Retrieval', fn: testActivityRetrieval },
    { name: 'Activity Feed', fn: testActivityFeed },
    { name: 'Activity Update', fn: testActivityUpdate },
    { name: 'Activity Reaction', fn: testActivityReaction },
    { name: 'Activity Search', fn: testActivitySearch },
    { name: 'Activity Analytics', fn: testActivityAnalytics },
    { name: 'Notifications', fn: testNotifications },
    { name: 'Activity Preferences', fn: testActivityPreferences },
    { name: 'Edge Cases', fn: testEdgeCases },
    { name: 'Comment Deletion', fn: testCommentDeletion },
    { name: 'Activity Deletion', fn: testActivityDeletion }
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
  
  console.log('\n📊 PHASE 6 TEST RESULTS:');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  console.log('\n📋 PHASE 6 API STATUS:');
  console.log('========================');
  console.log('✅ COMMENT APIs: Testing completed');
  console.log('✅ ACTIVITY APIs: Testing completed');
  console.log('✅ NOTIFICATION APIs: Testing completed');
  console.log('✅ ANALYTICS APIs: Testing completed');
  console.log('✅ SEARCH & FILTER APIs: Testing completed');
  console.log('✅ EDGE CASES: Testing completed');
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All Phase 6 APIs are working perfectly!');
    console.log('🚀 Phase 6: Comments & Communication System is COMPLETE!');
  } else {
    console.log('\n⚠️ Some Phase 6 APIs need attention.');
    console.log('🔧 Please check the failed tests above.');
  }
  
  return passedTests === totalTests;
};

// Run the tests
runPhase6Tests().catch(console.error);
