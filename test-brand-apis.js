const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function testAPIs() {
  try {
    console.log('🧪 Testing Brand Management APIs...\n');

    // Test 1: Login
    console.log('1️⃣ Testing Login API...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 50)}...`);
    } else {
      throw new Error('Login failed');
    }

    // Test 2: Get All Brands
    console.log('\n2️⃣ Testing Get All Brands API...');
    const brandsResponse = await axios.get(`${BASE_URL}/brands`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (brandsResponse.data.success) {
      console.log('✅ Get brands successful');
      console.log(`   Found ${brandsResponse.data.data.length} brands:`);
      brandsResponse.data.data.forEach(brand => {
        console.log(`   - ${brand.name} (${brand.slug}) - ${brand.role} - ${brand.subscription.plan} plan`);
      });
    } else {
      throw new Error('Get brands failed');
    }

    // Test 3: Get Brand Details (first brand)
    console.log('\n3️⃣ Testing Get Brand Details API...');
    const firstBrand = brandsResponse.data.data[0];
    const brandDetailsResponse = await axios.get(`${BASE_URL}/brands/${firstBrand.id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (brandDetailsResponse.data.success) {
      console.log('✅ Get brand details successful');
      console.log(`   Brand: ${brandDetailsResponse.data.data.name}`);
      console.log(`   Description: ${brandDetailsResponse.data.data.description}`);
      console.log(`   Status: ${brandDetailsResponse.data.data.status}`);
      console.log(`   Plan: ${brandDetailsResponse.data.data.subscription.plan}`);
    } else {
      throw new Error('Get brand details failed');
    }

    // Test 4: Switch to Brand
    console.log('\n4️⃣ Testing Switch to Brand API...');
    const switchResponse = await axios.post(`${BASE_URL}/brands/${firstBrand.id}/switch`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (switchResponse.data.success) {
      console.log('✅ Switch to brand successful');
      console.log(`   Switched to: ${switchResponse.data.data.brand_name}`);
      console.log(`   Role: ${switchResponse.data.data.role}`);
    } else {
      throw new Error('Switch to brand failed');
    }

    // Test 5: Get Brand Users
    console.log('\n5️⃣ Testing Get Brand Users API...');
    const brandUsersResponse = await axios.get(`${BASE_URL}/brands/${firstBrand.id}/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (brandUsersResponse.data.success) {
      console.log('✅ Get brand users successful');
      console.log(`   Found ${brandUsersResponse.data.data.length} users:`);
      brandUsersResponse.data.data.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      throw new Error('Get brand users failed');
    }

    // Test 6: Create a new brand
    console.log('\n6️⃣ Testing Create Brand API...');
    const newBrandData = {
      name: 'Test Brand',
      description: 'Test brand for API testing',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en'
      }
    };
    
    const createBrandResponse = await axios.post(`${BASE_URL}/brands`, newBrandData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createBrandResponse.data.success) {
      console.log('✅ Create brand successful');
      console.log(`   Created brand: ${createBrandResponse.data.data.name} (${createBrandResponse.data.data.id})`);
      const newBrandId = createBrandResponse.data.data.id;
      
      // Test 7: Update Brand
      console.log('\n7️⃣ Testing Update Brand API...');
      const updateData = {
        name: 'Test Brand Updated',
        description: 'Updated test brand description'
      };
      
      const updateResponse = await axios.put(`${BASE_URL}/brands/${newBrandId}`, updateData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (updateResponse.data.success) {
        console.log('✅ Update brand successful');
        console.log(`   Updated brand: ${updateResponse.data.data.name}`);
      } else {
        throw new Error('Update brand failed');
      }
      
      // Test 8: Delete Brand
      console.log('\n8️⃣ Testing Delete Brand API...');
      const deleteResponse = await axios.delete(`${BASE_URL}/brands/${newBrandId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (deleteResponse.data.success) {
        console.log('✅ Delete brand successful');
      } else {
        throw new Error('Delete brand failed');
      }
    } else {
      throw new Error('Create brand failed');
    }

    // Test 9: Test all brands again
    console.log('\n9️⃣ Testing Get All Brands API (Final Check)...');
    const finalBrandsResponse = await axios.get(`${BASE_URL}/brands`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (finalBrandsResponse.data.success) {
      console.log('✅ Final get brands successful');
      console.log(`   Found ${finalBrandsResponse.data.data.length} brands:`);
      finalBrandsResponse.data.data.forEach(brand => {
        console.log(`   - ${brand.name} (${brand.slug}) - ${brand.role} - ${brand.subscription.plan} plan`);
      });
    } else {
      throw new Error('Final get brands failed');
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Login API');
    console.log('   ✅ Get All Brands API');
    console.log('   ✅ Get Brand Details API');
    console.log('   ✅ Switch to Brand API');
    console.log('   ✅ Get Brand Users API');
    console.log('   ✅ Create Brand API');
    console.log('   ✅ Update Brand API');
    console.log('   ✅ Delete Brand API');
    console.log('   ✅ Final Verification');
    
    console.log('\n🚀 All Brand Management APIs are working perfectly!');

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testAPIs();
}

module.exports = testAPIs;
