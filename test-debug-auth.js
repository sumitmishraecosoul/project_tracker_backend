const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testUser = {
  name: 'Debug Auth Tester',
  email: `debugauth${Date.now()}@example.com`,
  password: 'TestPassword123!',
  employeeNumber: `EMP-DEBUG-${Date.now()}`,
  department: 'Data Analytics',
  username: `debugauth${Date.now()}`
};

const testBrand = {
  name: `Debug Auth Brand ${Date.now()}`,
  description: 'Brand for debugging auth issues'
};

const testProject = {
  title: 'Debug Auth Project',
  description: 'Project for debugging auth issues',
  status: 'Active',
  priority: 'Medium',
  department: 'Data Analytics',
  startDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
};

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
    console.error(`Error making ${method} request to ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

let authToken = '';
let brandId = '';

const debugAuth = async () => {
  console.log('🔍 Debugging Authentication and Authorization...');
  
  try {
    // 1. Register user
    console.log('1. Registering user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    
    // 2. Login user
    console.log('2. Logging in user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in successfully');
    console.log('Token:', authToken.substring(0, 50) + '...');
    
    // 3. Create brand
    console.log('3. Creating brand...');
    const brandResponse = await makeRequest('POST', '/brands', testBrand);
    brandId = brandResponse.data.data.id;
    console.log('✅ Brand created successfully');
    console.log('Brand ID:', brandId);
    
    // 4. Check user's brands
    console.log('4. Checking user brands...');
    const userBrandsResponse = await makeRequest('GET', '/brands');
    console.log('User brands:', JSON.stringify(userBrandsResponse.data, null, 2));
    
    // 5. Switch to brand
    console.log('5. Switching to brand...');
    const switchResponse = await makeRequest('POST', `/brands/${brandId}/switch`);
    console.log('✅ Switched to brand successfully');
    console.log('Switch response:', JSON.stringify(switchResponse.data, null, 2));
    
    // 6. Try to create project
    console.log('6. Creating project...');
    const projectResponse = await makeRequest('POST', `/brands/${brandId}/projects`, testProject);
    console.log('✅ Project created successfully');
    console.log('Project ID:', projectResponse.data.data._id);
    
    console.log('\n🎉 All authentication and authorization tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Debug test failed:', error.response?.data || error.message);
    return false;
  }
};

debugAuth().catch(console.error);
