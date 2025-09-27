const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  admin: {
    name: 'Invitation Flow Admin',
    email: `invitationflowadmin${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP${Date.now()}`
  },
  brand: {
    name: `Invitation Flow Brand ${Date.now()}`,
    description: 'Test brand for invitation flow testing',
    industry: 'Technology',
    website: 'https://test.com'
  },
  invitedUser: {
    name: 'Invited User',
    email: `inviteduser${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP${Date.now()}`
  }
};

let adminToken = '';
let userToken = '';
let brandId = '';
let adminUserId = '';
let invitedUserId = '';

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

const testUserRegistration = async () => {
  console.log('🔍 Testing User Registration...');
  const result = await apiCall('POST', '/auth/register', testConfig.invitedUser);
  
  if (result.success) {
    userToken = result.data.token;
    invitedUserId = result.data.user._id;
    console.log('✅ User registration successful');
    console.log(`   User ID: ${invitedUserId}`);
    return true;
  } else {
    console.log('❌ User registration failed:', result.error);
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

const testInviteUser = async () => {
  console.log('🔍 Testing User Invitation...');
  const result = await apiCall('POST', `/brands/${brandId}/users/invite`, {
    email: testConfig.invitedUser.email,
    role: 'member'
  }, {}, adminToken);
  
  if (result.success) {
    console.log('✅ User invited successfully');
    console.log(`   Status: ${result.data.data.status}`);
    return true;
  } else {
    console.log('❌ User invitation failed:', result.error);
    return false;
  }
};

const testGetUserInvitations = async () => {
  console.log('🔍 Testing Get User Invitations...');
  const result = await apiCall('GET', '/users/invitations', null, {}, userToken);
  
  if (result.success) {
    const invitations = result.data.data;
    console.log('✅ User invitations retrieved successfully');
    console.log(`   Found ${invitations.length} pending invitations`);
    
    if (invitations.length > 0) {
      const invitation = invitations[0];
      console.log('   Invitation Details:');
      console.log(`   - Brand: ${invitation.brand.name}`);
      console.log(`   - Role: ${invitation.role}`);
      console.log(`   - Status: ${invitation.status}`);
      console.log(`   - Invited by: ${invitation.invited_by.name}`);
    }
    
    return true;
  } else {
    console.log('❌ Get user invitations failed:', result.error);
    return false;
  }
};

const testAcceptInvitation = async () => {
  console.log('🔍 Testing Accept Invitation...');
  const result = await apiCall('POST', `/brands/${brandId}/users/accept`, null, {}, userToken);
  
  if (result.success) {
    console.log('✅ Invitation accepted successfully');
    console.log(`   Status: ${result.data.data.status}`);
    console.log(`   Role: ${result.data.data.role}`);
    console.log(`   Brand: ${result.data.data.brand.name}`);
    return true;
  } else {
    console.log('❌ Accept invitation failed:', result.error);
    return false;
  }
};

const testGetBrandUsersAfterAcceptance = async () => {
  console.log('🔍 Testing Get Brand Users After Acceptance...');
  const result = await apiCall('GET', `/brands/${brandId}/users`, null, {}, adminToken);
  
  if (result.success) {
    const users = result.data.data;
    console.log('✅ Brand users retrieved successfully');
    console.log(`   Found ${users.length} users`);
    
    // Check if the accepted user is now active
    const acceptedUser = users.find(user => user.email === testConfig.invitedUser.email);
    if (acceptedUser) {
      console.log('✅ Accepted user found in brand users:');
      console.log(`   - Name: ${acceptedUser.name}`);
      console.log(`   - Email: ${acceptedUser.email}`);
      console.log(`   - Role: ${acceptedUser.role}`);
      console.log(`   - Status: ${acceptedUser.status}`);
      
      if (acceptedUser.status === 'active') {
        console.log('✅ User status is now ACTIVE - Flow working perfectly!');
        return true;
      } else {
        console.log('❌ User status is not active:', acceptedUser.status);
        return false;
      }
    } else {
      console.log('❌ Accepted user not found in brand users');
      return false;
    }
  } else {
    console.log('❌ Get brand users failed:', result.error);
    return false;
  }
};

const testDeclineInvitation = async () => {
  console.log('🔍 Testing Decline Invitation (New User)...');
  
  // Create another user for decline test
  const declineUser = {
    name: 'Decline Test User',
    email: `declinetest${Date.now()}@test.com`,
    password: 'Test123!',
    department: 'Data Analytics',
    employeeNumber: `EMP${Date.now()}`
  };
  
  // Register decline user
  const registerResult = await apiCall('POST', '/auth/register', declineUser);
  if (!registerResult.success) {
    console.log('❌ Decline user registration failed:', registerResult.error);
    return false;
  }
  
  const declineUserToken = registerResult.data.token;
  
  // Invite decline user
  const inviteResult = await apiCall('POST', `/brands/${brandId}/users/invite`, {
    email: declineUser.email,
    role: 'member'
  }, {}, adminToken);
  
  if (!inviteResult.success) {
    console.log('❌ Decline user invitation failed:', inviteResult.error);
    return false;
  }
  
  // Decline invitation
  const result = await apiCall('POST', `/brands/${brandId}/users/decline`, null, {}, declineUserToken);
  
  if (result.success) {
    console.log('✅ Invitation declined successfully');
    return true;
  } else {
    console.log('❌ Decline invitation failed:', result.error);
    return false;
  }
};

// Main test runner
const runUserInvitationFlowTests = async () => {
  console.log('🚀 Starting User Invitation Acceptance Flow Testing...');
  console.log('====================================================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Admin Registration', fn: testAdminRegistration },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Brand Creation', fn: testBrandCreation },
    { name: 'Invite User', fn: testInviteUser },
    { name: 'Get User Invitations', fn: testGetUserInvitations },
    { name: 'Accept Invitation', fn: testAcceptInvitation },
    { name: 'Get Brand Users After Acceptance', fn: testGetBrandUsersAfterAcceptance },
    { name: 'Decline Invitation', fn: testDeclineInvitation }
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
  
  console.log('\n📊 USER INVITATION ACCEPTANCE FLOW TEST RESULTS:');
  console.log('================================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 User Invitation Acceptance Flow is working perfectly!');
    console.log('🚀 Complete user invitation system is now functional!');
    console.log('\n📋 COMPLETE FLOW IMPLEMENTED:');
    console.log('✅ Admin can invite users');
    console.log('✅ Users can see their pending invitations');
    console.log('✅ Users can accept invitations');
    console.log('✅ Users can decline invitations');
    console.log('✅ Status changes from pending to active');
    console.log('✅ Accepted users appear in brand users list');
    console.log('✅ Complete user invitation management system');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  return passedTests === totalTests;
};

// Run the tests
runUserInvitationFlowTests().catch(console.error);
