const axios = require('axios');

async function debugAdminLogin() {
    console.log('🔍 Debugging Admin Login...');
    
    const API_BASE = 'http://localhost:5000/api';
    
    // Test different admin credentials
    const adminCredentials = [
        { email: 'admin@system.local', password: 'admin123' },
        { email: 'sumitmishra.sm04@gmail.com', password: 'admin123' },
        { email: 'admin@system.local', password: 'password' },
        { email: 'sumitmishra.sm04@gmail.com', password: 'password' }
    ];
    
    for (const creds of adminCredentials) {
        try {
            console.log(`\n📝 Testing: ${creds.email}`);
            const response = await axios.post(`${API_BASE}/auth/login`, creds);
            
            if (response.data.success) {
                console.log('✅ Login successful!');
                console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
                console.log(`   User: ${response.data.user.name}`);
                return response.data;
            } else {
                console.log('❌ Login failed:', response.data.message);
            }
        } catch (error) {
            console.log('❌ Request failed:', error.response?.data?.message || error.message);
        }
    }
    
    console.log('\n❌ No working admin credentials found');
}

debugAdminLogin().catch(console.error);
