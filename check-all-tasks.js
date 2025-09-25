const mongoose = require('mongoose');
const Task = require('./models/Task');

const checkAllTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/asana');
    console.log('Connected to MongoDB');
    
    // Get all tasks
    const allTasks = await Task.find({}).select('id task createdAt brand_id').sort({ createdAt: -1 });
    console.log(`Total tasks in database: ${allTasks.length}`);
    
    if (allTasks.length > 0) {
      console.log('\nAll tasks:');
      allTasks.forEach((task, index) => {
        console.log(`${index + 1}. ID: ${task.id}, Task: ${task.task}, Brand: ${task.brand_id}, Created: ${task.createdAt}`);
      });
    } else {
      console.log('No tasks found in database');
    }
    
    // Check for TASK-0001 specifically
    const task0001 = await Task.findOne({ id: 'TASK-0001' });
    if (task0001) {
      console.log('\nTASK-0001 found:', task0001);
    } else {
      console.log('\nTASK-0001 not found');
    }
    
    // Check for any tasks with TASK- prefix
    const taskPrefixTasks = await Task.find({ id: { $regex: /^TASK-/ } }).select('id task createdAt brand_id');
    console.log(`\nTasks with TASK- prefix: ${taskPrefixTasks.length}`);
    taskPrefixTasks.forEach((task, index) => {
      console.log(`${index + 1}. ID: ${task.id}, Task: ${task.task}, Brand: ${task.brand_id}, Created: ${task.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkAllTasks().catch(console.error);

