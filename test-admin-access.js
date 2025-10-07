const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminAccess() {
  try {
    console.log('🔐 TESTING ADMIN ACCESS TO ALL BRANDS\n');

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

    // Step 3: Test access to each brand
    for (let i = 0; i < brandsResponse.data.data.length; i++) {
      const brand = brandsResponse.data.data[i];
      console.log(`\n3.${i + 1} Testing access to brand: ${brand.name}`);
      
      try {
        // Test brand details access
        const brandDetailsResponse = await axios.get(`${BASE_URL}/api/brands/${brand.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   ✅ Brand details access: SUCCESS');
        
        // Test brand users access
        const brandUsersResponse = await axios.get(`${BASE_URL}/api/brands/${brand.id}/users`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   ✅ Brand users access: SUCCESS');
        console.log(`   📊 Users in brand: ${brandUsersResponse.data.data.length}`);
        
      } catch (error) {
        if (error.response?.data?.error?.code === 'ACCESS_DENIED') {
          console.log('   ❌ ACCESS_DENIED - This should not happen for admin!');
        } else {
          console.log('   ❌ Error:', error.response?.data?.error?.message || error.message);
        }
      }
    }

    console.log('\n🎉 ADMIN ACCESS TEST COMPLETED!');
    console.log('✅ Admin should have access to ALL brands');
    console.log('✅ No ACCESS_DENIED errors should occur');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   node server.js');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

testAdminAccess();
