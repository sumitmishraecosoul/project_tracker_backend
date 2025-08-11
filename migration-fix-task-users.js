const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const Task = require('./models/Task');
const User = require('./models/User');

// Helper function to find user by name or email
const findUserByIdentifier = async (identifier) => {
  if (!identifier) return null;

  // If it's already an ObjectId, validate it exists
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const user = await User.findById(identifier);
    return user ? user._id : null;
  }

  // If it's an email, find user by email
  if (identifier.includes('@')) {
    const user = await User.findOne({ email: identifier.toLowerCase() });
    return user ? user._id : null;
  }

  // If it's a name, find user by name (case insensitive)
  const user = await User.findOne({ name: { $regex: new RegExp(identifier, 'i') } });
  return user ? user._id : null;
};

// Migration function
const migrateTaskUsers = async () => {
  try {
    console.log('Starting task user migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all tasks
    const tasks = await Task.find({});
    console.log(`Found ${tasks.length} tasks to process`);

    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const task of tasks) {
      try {
        let needsUpdate = false;
        const updateData = {};

        // Check assignedTo field
        if (task.assignedTo && typeof task.assignedTo === 'string') {
          const assignedToId = await findUserByIdentifier(task.assignedTo);
          if (assignedToId) {
            updateData.assignedTo = assignedToId;
            needsUpdate = true;
            console.log(`Task ${task.id}: Converting assignedTo "${task.assignedTo}" to user ID ${assignedToId}`);
          } else {
            console.warn(`Task ${task.id}: Could not find user for assignedTo "${task.assignedTo}"`);
            errors.push(`Task ${task.id}: No user found for assignedTo "${task.assignedTo}"`);
            errorCount++;
          }
        }

        // Check reporter field
        if (task.reporter && typeof task.reporter === 'string') {
          const reporterId = await findUserByIdentifier(task.reporter);
          if (reporterId) {
            updateData.reporter = reporterId;
            needsUpdate = true;
            console.log(`Task ${task.id}: Converting reporter "${task.reporter}" to user ID ${reporterId}`);
          } else {
            console.warn(`Task ${task.id}: Could not find user for reporter "${task.reporter}"`);
            errors.push(`Task ${task.id}: No user found for reporter "${task.reporter}"`);
            errorCount++;
          }
        }

        // Update task if needed
        if (needsUpdate) {
          await Task.findByIdAndUpdate(task._id, updateData);
          updatedCount++;
        }

      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error.message);
        errors.push(`Task ${task.id}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total tasks processed: ${tasks.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(error => console.log(error));
    }

    console.log('\nMigration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateTaskUsers();
}

module.exports = migrateTaskUsers;
