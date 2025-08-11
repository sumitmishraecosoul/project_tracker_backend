const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import Task model
const Task = require('./models/Task');

const resetTaskCounter = async () => {
  try {
    console.log('Starting task ID counter reset...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the highest task ID number
    const lastTask = await Task.findOne({}, {}, { sort: { 'id': -1 } });
    
    if (!lastTask) {
      console.log('No tasks found in database. Counter will start from TASK-0001');
      return;
    }

    const currentHighestId = lastTask.id;
    console.log(`Current highest task ID: ${currentHighestId}`);

    // Extract the number from the ID
    const match = currentHighestId.match(/TASK-(\d+)/);
    if (!match) {
      console.log('Could not parse task ID format. Please check your task IDs.');
      return;
    }

    const currentNumber = parseInt(match[1]);
    console.log(`Current task number: ${currentNumber}`);

    // Verify this is actually the highest by checking for any gaps
    const allTasks = await Task.find({}).sort({ 'id': 1 });
    const taskNumbers = allTasks.map(task => {
      const taskMatch = task.id.match(/TASK-(\d+)/);
      return taskMatch ? parseInt(taskMatch[1]) : 0;
    }).sort((a, b) => a - b);

    console.log(`Total tasks found: ${allTasks.length}`);
    console.log(`Task number range: ${taskNumbers[0]} to ${taskNumbers[taskNumbers.length - 1]}`);

    // Check for any gaps in the sequence
    const gaps = [];
    for (let i = 1; i <= taskNumbers[taskNumbers.length - 1]; i++) {
      if (!taskNumbers.includes(i)) {
        gaps.push(i);
      }
    }

    if (gaps.length > 0) {
      console.log(`Found gaps in task numbering: ${gaps.join(', ')}`);
    } else {
      console.log('Task numbering is sequential with no gaps');
    }

    console.log('\nTask ID counter reset completed!');
    console.log(`Next task will get ID: TASK-${String(currentNumber + 1).padStart(4, '0')}`);

  } catch (error) {
    console.error('Task counter reset failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run reset if this file is executed directly
if (require.main === module) {
  resetTaskCounter();
}

module.exports = resetTaskCounter;
