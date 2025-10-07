const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminInvitation() {
  try {
    console.log('📧 TESTING ADMIN INVITATION PERMISSIONS\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    const authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Get all brands
    console.log('\n2. Getting all brands...');
    const brandsResponse = await axios.get(`${BASE_URL}/api/brands`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Brands retrieved:', brandsResponse.data.data.length);
    
    if (brandsResponse.data.data.length === 0) {
      console.log('❌ No brands found. Please create some brands first.');
      return;
    }

    const brandId = brandsResponse.data.data[0].id;
    console.log('   Using brand:', brandsResponse.data.data[0].name);

    // Step 3: Test invitation permissions
    console.log('\n3. Testing invitation permissions...');
    
    try {
      // Test invitation endpoint
      const inviteResponse = await axios.post(`${BASE_URL}/api/brands/${brandId}/users/invite`, {
        email: 'test@example.com',
        role: 'member',
        message: 'Test invitation from admin'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Invitation endpoint access: SUCCESS');
      console.log('   Response:', inviteResponse.data.message);
      
    } catch (error) {
      if (error.response?.data?.error?.code === 'PERMISSION_DENIED') {
        console.log('❌ PERMISSION_DENIED - Admin should have invitation permissions!');
        console.log('   Error:', error.response.data.error.message);
      } else if (error.response?.data?.error?.code === 'USER_NOT_FOUND') {
        console.log('✅ Invitation endpoint access: SUCCESS (User not found is expected)');
        console.log('   This confirms admin has permission to invite users');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error?.message || error.message);
      }
    }

    // Step 4: Test pending invitations access
    console.log('\n4. Testing pending invitations access...');
    
    try {
      const pendingResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/users/pending`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Pending invitations access: SUCCESS');
      console.log('   Pending invitations:', pendingResponse.data.data.length);
      
    } catch (error) {
      if (error.response?.data?.error?.code === 'PERMISSION_DENIED') {
        console.log('❌ PERMISSION_DENIED - Admin should have access to pending invitations!');
        console.log('   Error:', error.response.data.error.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.error?.message || error.message);
      }
    }

    console.log('\n🎉 ADMIN INVITATION PERMISSIONS TEST COMPLETED!');
    console.log('✅ Admin should have permission to invite users to any brand');
    console.log('✅ Admin should have access to pending invitations');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   node server.js');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

testAdminInvitation();
