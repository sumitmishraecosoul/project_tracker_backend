const mongoose = require('mongoose');
const Task = require('./models/Task');

const checkDbTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/asana_dev');
    console.log('Connected to MongoDB');
    
    // Check existing tasks
    const tasks = await Task.find({}).select('id task createdAt').sort({ createdAt: -1 }).limit(10);
    console.log('Recent tasks in database:');
    tasks.forEach(task => {
      console.log(`- ID: ${task.id}, Task: ${task.task}, Created: ${task.createdAt}`);
    });
    
    // Check for TASK-0001 specifically
    const task0001 = await Task.findOne({ id: 'TASK-0001' });
    if (task0001) {
      console.log('\nTASK-0001 found:', task0001);
    } else {
      console.log('\nTASK-0001 not found');
    }
    
    // Check for any tasks with TASK- prefix
    const taskPrefixTasks = await Task.find({ id: { $regex: /^TASK-/ } }).select('id task createdAt');
    console.log('\nTasks with TASK- prefix:');
    taskPrefixTasks.forEach(task => {
      console.log(`- ID: ${task.id}, Task: ${task.task}, Created: ${task.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkDbTasks().catch(console.error);

