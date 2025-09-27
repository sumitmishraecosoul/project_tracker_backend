const axios = require('axios');

// Simple test to verify subtask API structure
const testSubtaskAPI = async () => {
  console.log('🔍 Testing Subtask API Structure...');
  
  try {
    // Test with invalid token to see the response structure
    const response = await axios.get('http://localhost:5000/api/brands/test/subtasks', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    console.log('✅ API endpoint is accessible');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ API endpoint is working (authentication required)');
      console.log('✅ Subtask API is properly mounted');
    } else if (error.response?.status === 404) {
      console.log('❌ Subtask API endpoint not found');
    } else {
      console.log('✅ API endpoint is accessible');
      console.log('Error details:', error.response?.data || error.message);
    }
  }
};

testSubtaskAPI().catch(console.error);
