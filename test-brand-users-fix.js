const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  admin: {
    name: 'Brand Users Test Admin',
    email: `branduserstest${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP${Date.now()}`
  },
  brand: {
    name: `Brand Users Test Brand ${Date.now()}`,
    description: 'Test brand for user management testing',
    industry: 'Technology',
    website: 'https://test.com'
  },
  user1: {
    name: 'Test User 1',
    email: `testuser1${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP1${Date.now()}`
  },
  user2: {
    name: 'Test User 2',
    email: `testuser2${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP2${Date.now()}`
  }
};

let authToken = '';
let brandId = '';
let userId1 = '';
let userId2 = '';

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
    authToken = result.data.token;
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

const testUser1Registration = async () => {
  console.log('🔍 Testing User 1 Registration...');
  const result = await apiCall('POST', '/auth/register', testConfig.user1);
  
  if (result.success) {
    userId1 = result.data.user._id;
    console.log('✅ User 1 registration successful');
    console.log(`   User 1 ID: ${userId1}`);
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
    userId2 = result.data.user._id;
    console.log('✅ User 2 registration successful');
    console.log(`   User 2 ID: ${userId2}`);
    return true;
  } else {
    console.log('❌ User 2 registration failed:', result.error);
    return false;
  }
};

const testInviteUser1 = async () => {
  console.log('🔍 Testing Invite User 1...');
  const result = await apiCall('POST', `/brands/${brandId}/users/invite`, {
    email: testConfig.user1.email,
    role: 'member'
  });
  
  if (result.success) {
    console.log('✅ User 1 invited successfully');
    return true;
  } else {
    console.log('❌ User 1 invitation failed:', result.error);
    return false;
  }
};

const testInviteUser2 = async () => {
  console.log('🔍 Testing Invite User 2...');
  const result = await apiCall('POST', `/brands/${brandId}/users/invite`, {
    email: testConfig.user2.email,
    role: 'member'
  });
  
  if (result.success) {
    console.log('✅ User 2 invited successfully');
    return true;
  } else {
    console.log('❌ User 2 invitation failed:', result.error);
    return false;
  }
};

const testGetBrandUsers = async () => {
  console.log('🔍 Testing Get Brand Users...');
  const result = await apiCall('GET', `/brands/${brandId}/users`);
  
  if (result.success) {
    const users = result.data.data;
    console.log('✅ Brand users retrieved successfully');
    console.log(`   Found ${users.length} users`);
    
    // Check if all users are returned
    users.forEach((user, index) => {
      console.log(`   User ${index + 1}:`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Status: ${user.status}`);
    });
    
    // Check if the fix is working
    if (users.length >= 3) { // Admin + 2 invited users
      console.log('✅ FIX WORKING: All users are returned (including invited users)');
      return true;
    } else {
      console.log('❌ FIX NOT WORKING: Only some users are returned');
      console.log(`   Expected: 3+ users, Got: ${users.length} users`);
      return false;
    }
  } else {
    console.log('❌ Get brand users failed:', result.error);
    return false;
  }
};

// Main test runner
const runBrandUsersFixTests = async () => {
  console.log('🚀 Starting Brand Users Fix Testing...');
  console.log('====================================================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Registration', fn: testAdminRegistration },
    { name: 'Brand Creation', fn: testBrandCreation },
    { name: 'User 1 Registration', fn: testUser1Registration },
    { name: 'User 2 Registration', fn: testUser2Registration },
    { name: 'Invite User 1', fn: testInviteUser1 },
    { name: 'Invite User 2', fn: testInviteUser2 },
    { name: 'Get Brand Users', fn: testGetBrandUsers }
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
  
  console.log('\n📊 BRAND USERS FIX TEST RESULTS:');
  console.log('=================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Brand Users API fix is working perfectly!');
    console.log('🚀 All invited users are now returned by the API!');
    console.log('\n📋 FIX SUMMARY:');
    console.log('✅ Removed status filter from getBrandUsers method');
    console.log('✅ API now returns all users (active and pending)');
    console.log('✅ Invited users are now visible in the frontend');
    console.log('✅ Brand user management is working correctly');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  return passedTests === totalTests;
};

// Run the tests
runBrandUsersFixTests().catch(console.error);
