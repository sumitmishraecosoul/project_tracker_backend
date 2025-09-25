const axios = require('axios');

async function testInviteAPI() {
    console.log('🔧 Testing Invite User API...');
    
    try {
        // Login first
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin.phase4@example.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Get brand ID
        const brandsResponse = await axios.get('http://localhost:5000/api/brands', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const brandId = brandsResponse.data.data[0].id;
        console.log(`✅ Brand ID: ${brandId}`);
        
        // Test invite non-existing user
        console.log('\n📝 Testing invite non-existing user...');
        try {
            const inviteResponse = await axios.post(`http://localhost:5000/api/brands/${brandId}/users/invite`, {
                email: 'nonexistent.user@example.com',
                role: 'member',
                message: 'You are invited!'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('❌ UNEXPECTED: User was created instead of rejected');
            console.log('Response:', inviteResponse.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ SUCCESS: User not found (404) - API working correctly!');
                console.log('Message:', error.response.data.error.message);
                console.log('Details:', error.response.data.error.details);
            } else {
                console.log('❌ UNEXPECTED ERROR:', error.response?.status);
                console.log('Error:', error.response?.data);
            }
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testInviteAPI();
