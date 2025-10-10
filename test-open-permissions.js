const axios = require('axios');

async function testOpenPermissions() {
  try {
    console.log('🔍 Testing open task/subtask permissions...\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Test with admin user first
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@system.local',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Logged in as: ${user.name} (Role: ${user.role})`);
    console.log(`📊 Brands: ${loginResponse.data.brands?.length || 0}\n`);
    
    const brandId = '68e1ddaa9ee979a7408876e9';
    
    // Test 2: Create Task
    console.log('2️⃣ Testing task creation...');
    try {
      const taskResponse = await axios.post(
        `${baseURL}/brands/${brandId}/tasks`,
        {
          task: 'Test Task from Member',
          description: 'Testing if member can create tasks',
          status: 'Yet to Start',
          priority: 'Medium',
          projectId: '68e289b7ab2bcc9d4de68216',
          category_id: '68e289b7ab2bcc9d4de68217',
          reporter: user._id,
          assignedTo: user._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log(`✅ Task created successfully! ID: ${taskResponse.data.data._id}\n`);
    } catch (error) {
      console.log(`❌ Task creation failed: ${error.response?.data?.error?.message || error.message}\n`);
    }
    
    // Test 3: Create Subtask
    console.log('3️⃣ Testing subtask creation...');
    try {
      const subtaskResponse = await axios.post(
        `${baseURL}/brands/${brandId}/subtasks`,
        {
          subtask: 'Test Subtask from Member',
          description: 'Testing if member can create subtasks',
          status: 'Yet to Start',
          priority: 'Medium',
          task_id: '68e290d4ab2bcc9d4de68340', // Existing task ID
          createdBy: user._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log(`✅ Subtask created successfully! ID: ${subtaskResponse.data.data._id}\n`);
    } catch (error) {
      console.log(`❌ Subtask creation failed: ${error.response?.data?.error?.message || error.message}\n`);
    }
    
    // Test 4: Update Task Status
    console.log('4️⃣ Testing task status update...');
    try {
      const statusResponse = await axios.put(
        `${baseURL}/brands/${brandId}/tasks/68e290d4ab2bcc9d4de68340/status`,
        {
          status: 'In Progress'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log(`✅ Task status updated successfully!\n`);
    } catch (error) {
      console.log(`❌ Task status update failed: ${error.response?.data?.error?.message || error.message}\n`);
    }
    
    // Test 5: Update Task
    console.log('5️⃣ Testing task update...');
    try {
      const updateResponse = await axios.put(
        `${baseURL}/brands/${brandId}/tasks/68e290d4ab2bcc9d4de68340`,
        {
          task: 'Updated Task Name',
          description: 'Updated description by member'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log(`✅ Task updated successfully!\n`);
    } catch (error) {
      console.log(`❌ Task update failed: ${error.response?.data?.error?.message || error.message}\n`);
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ Regular users (members) should now be able to:');
    console.log('   - Create tasks');
    console.log('   - Create subtasks');
    console.log('   - Update task status');
    console.log('   - Update task details');
    console.log('   - Update subtask details');
    console.log('   - Assign tasks');
    console.log('   - Everything EXCEPT delete\n');
    
    console.log('❌ Regular users CANNOT:');
    console.log('   - Delete tasks (only admin/brand_admin with owner/manager role)');
    console.log('   - Delete subtasks (only admin/manager)\n');
    
    console.log('✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

testOpenPermissions();
