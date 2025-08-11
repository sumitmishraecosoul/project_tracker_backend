const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import Task model
const Task = require('./models/Task');

const testTaskCreation = async () => {
  try {
    console.log('Testing task creation with auto-generated IDs...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing test tasks
    await Task.deleteMany({ projectId: 'TEST-PROJECT' });
    console.log('Cleared existing test tasks');

    // Test creating multiple tasks
    const testTasks = [
      {
        projectId: 'TEST-PROJECT',
        task: 'Test Task 1',
        description: 'First test task',
        assignedTo: '507f1f77bcf86cd799439011', // Mock user ID
        reporter: '507f1f77bcf86cd799439012',   // Mock user ID
        eta: new Date('2024-12-31'),
        taskType: 'Feature',
        priority: 'High'
      },
      {
        projectId: 'TEST-PROJECT',
        task: 'Test Task 2',
        description: 'Second test task',
        assignedTo: '507f1f77bcf86cd799439011',
        reporter: '507f1f77bcf86cd799439012',
        eta: new Date('2024-12-31'),
        taskType: 'Bug',
        priority: 'Critical'
      },
      {
        projectId: 'TEST-PROJECT',
        task: 'Test Task 3',
        description: 'Third test task',
        assignedTo: '507f1f77bcf86cd799439011',
        reporter: '507f1f77bcf86cd799439012',
        eta: new Date('2024-12-31'),
        taskType: 'Documentation',
        priority: 'Medium'
      }
    ];

    console.log('\nCreating test tasks...');
    
    for (let i = 0; i < testTasks.length; i++) {
      try {
        const task = new Task(testTasks[i]);
        await task.save();
        console.log(`✓ Created task: ${task.id} - ${task.task}`);
      } catch (error) {
        console.error(`✗ Failed to create task ${i + 1}:`, error.message);
      }
    }

    // Verify all tasks were created with sequential IDs
    const createdTasks = await Task.find({ projectId: 'TEST-PROJECT' }).sort({ id: 1 });
    console.log('\n=== Created Tasks ===');
    createdTasks.forEach(task => {
      console.log(`${task.id}: ${task.task}`);
    });

    // Check if IDs are sequential
    const taskNumbers = createdTasks.map(task => {
      const match = task.id.match(/TASK-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    console.log('\n=== Task Numbers ===');
    console.log('Task numbers:', taskNumbers);

    const isSequential = taskNumbers.every((num, index) => {
      if (index === 0) return num > 0;
      return num === taskNumbers[index - 1] + 1;
    });

    if (isSequential) {
      console.log('✅ Task IDs are sequential!');
    } else {
      console.log('❌ Task IDs are not sequential!');
    }

    console.log('\nTest completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testTaskCreation();
}

module.exports = testTaskCreation;
