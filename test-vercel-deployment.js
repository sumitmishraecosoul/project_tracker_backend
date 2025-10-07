const axios = require('axios');

// Test script to verify Vercel deployment
async function testDeployment() {
  try {
    console.log('🧪 Testing Vercel deployment...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('https://your-vercel-app.vercel.app/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test basic endpoint
    console.log('\n2. Testing basic endpoint...');
    const basicResponse = await axios.get('https://your-vercel-app.vercel.app/');
    console.log('✅ Basic endpoint passed:', basicResponse.data);
    
    console.log('\n🎉 All tests passed! Vercel deployment is working correctly.');
    
  } catch (error) {
    console.error('❌ Deployment test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDeployment();
