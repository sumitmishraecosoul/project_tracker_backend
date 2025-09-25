const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const timestamp = Date.now();
const testUser = {
  name: 'Token Debug Tester',
  email: `tokendebug${timestamp}@example.com`,
  password: 'TestPassword123!',
  employeeNumber: `EMP-TOKEN-${timestamp}`,
  department: 'Data Analytics',
  username: `tokendebug${timestamp}`
};

const testBrand = {
  name: `Token Debug Brand ${timestamp}`,
  description: 'Brand for token debugging',
  website: 'https://tokendebug.com',
  industry: 'Technology'
};

const debugToken = async () => {
  console.log('🔍 DEBUGGING TOKEN VALIDATION');
  console.log('='.repeat(50));
  
  try {
    // 1. Register user
    console.log('1. Registering user...');
    await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered');
    
    // 2. Login user
    console.log('2. Logging in user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    let authToken = loginResponse.data.token;
    console.log('✅ User logged in');
    
    // 3. Decode initial token
    console.log('3. Decoding initial token...');
    const initialDecoded = jwt.decode(authToken);
    console.log('Initial token payload:', JSON.stringify(initialDecoded, null, 2));
    
    // 4. Create brand
    console.log('4. Creating brand...');
    const brandResponse = await axios.post(`${BASE_URL}/brands`, testBrand, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const brandId = brandResponse.data.data.id;
    console.log('✅ Brand created:', brandId);
    
    // 5. Switch to brand
    console.log('5. Switching to brand...');
    const switchResponse = await axios.post(`${BASE_URL}/brands/${brandId}/switch`, {}, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    authToken = switchResponse.data.token;
    console.log('✅ Brand switched');
    
    // 6. Decode new token
    console.log('6. Decoding new token...');
    const newDecoded = jwt.decode(authToken);
    console.log('New token payload:', JSON.stringify(newDecoded, null, 2));
    
    // 7. Test project creation with new token
    console.log('7. Testing project creation with new token...');
    try {
      const projectResponse = await axios.post(`${BASE_URL}/brands/${brandId}/projects`, {
        title: 'Token Debug Project',
        description: 'Project for token debugging',
        status: 'Active',
        priority: 'Medium',
        department: 'Data Analytics',
        startDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('✅ Project created successfully');
    } catch (error) {
      console.log('❌ Project creation failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

debugToken().catch(console.error);

