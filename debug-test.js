const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugTest() {
  try {
    console.log('🔍 DEBUGGING TEST...\n');

    // Step 1: Test login
    console.log('1. Testing login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@system.local',
        password: 'admin123'
      });
      console.log('✅ Login successful');
      console.log('   Token length:', loginResponse.data.data.token.length);
      
      const authToken = loginResponse.data.data.token;
      
      // Step 2: Test brands
      console.log('\n2. Testing brands...');
      const brandsResponse = await axios.get(`${BASE_URL}/api/brands`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Brands retrieved:', brandsResponse.data.data.length);
      
      if (brandsResponse.data.data.length > 0) {
        const brandId = brandsResponse.data.data[0].id;
        console.log('   Brand ID:', brandId);
        
        // Step 3: Test projects
        console.log('\n3. Testing projects...');
        const projectsResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/projects`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Projects retrieved:', projectsResponse.data.data.length);
        
        if (projectsResponse.data.data.length > 0) {
          const projectId = projectsResponse.data.data[0].id;
          console.log('   Project ID:', projectId);
          
          // Step 4: Test tasks
          console.log('\n4. Testing tasks...');
          const tasksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks?projectId=${projectId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('✅ Tasks retrieved:', tasksResponse.data.data.tasks.length);
          
          if (tasksResponse.data.data.tasks.length > 0) {
            const taskId = tasksResponse.data.data.tasks[0].id;
            console.log('   Task ID:', taskId);
            
            // Step 5: Test task links
            console.log('\n5. Testing task links...');
            try {
              const linksResponse = await axios.get(`${BASE_URL}/api/brands/${brandId}/tasks/${taskId}/links`, {
                headers: { Authorization: `Bearer ${authToken}` }
              });
              console.log('✅ Task links retrieved:', linksResponse.data.data.length);
            } catch (error) {
              console.log('❌ Task links failed:', error.response?.status, error.response?.data?.error?.message);
            }
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugTest();
