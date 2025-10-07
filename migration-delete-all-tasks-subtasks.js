const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ Error: MONGODB_URI or MONGO_URI environment variable is not set');
  process.exit(1);
}

// Simple schema definitions (we don't need full models for deletion)
const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false, collection: 'tasks' }));
const Subtask = mongoose.model('Subtask', new mongoose.Schema({}, { strict: false, collection: 'subtasks' }));
const UserTask = mongoose.model('UserTask', new mongoose.Schema({}, { strict: false, collection: 'usertasks' }));

async function migrateData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    console.log('=' .repeat(70));
    console.log('    MIGRATION: DELETE ALL TASKS AND SUBTASKS');
    console.log('=' .repeat(70));
    console.log('\n⚠️  WARNING: This will permanently delete ALL tasks and subtasks!');
    console.log('⚠️  This is required before implementing the new Category system.');
    console.log('\nStarting in 5 seconds... Press Ctrl+C to cancel.\n');

    // Wait 5 seconds to give user a chance to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get counts before deletion
    console.log('📊 Counting existing data...\n');
    const taskCount = await Task.countDocuments({});
    const subtaskCount = await Subtask.countDocuments({});
    const userTaskCount = await UserTask.countDocuments({});

    console.log(`   Tasks found: ${taskCount}`);
    console.log(`   Subtasks found: ${subtaskCount}`);
    console.log(`   UserTasks found: ${userTaskCount}\n`);

    if (taskCount === 0 && subtaskCount === 0 && userTaskCount === 0) {
      console.log('✅ No tasks or subtasks found. Nothing to delete.\n');
      await mongoose.connection.close();
      console.log('✅ Migration completed successfully!');
      process.exit(0);
    }

    // Delete all subtasks first (due to dependencies)
    console.log('🗑️  Deleting all subtasks...');
    const subtaskResult = await Subtask.deleteMany({});
    console.log(`   ✅ Deleted ${subtaskResult.deletedCount} subtasks\n`);

    // Delete all user tasks
    console.log('🗑️  Deleting all user tasks...');
    const userTaskResult = await UserTask.deleteMany({});
    console.log(`   ✅ Deleted ${userTaskResult.deletedCount} user tasks\n`);

    // Delete all tasks
    console.log('🗑️  Deleting all tasks...');
    const taskResult = await Task.deleteMany({});
    console.log(`   ✅ Deleted ${taskResult.deletedCount} tasks\n`);

    // Verify deletion
    console.log('🔍 Verifying deletion...\n');
    const remainingTasks = await Task.countDocuments({});
    const remainingSubtasks = await Subtask.countDocuments({});
    const remainingUserTasks = await UserTask.countDocuments({});

    console.log(`   Remaining tasks: ${remainingTasks}`);
    console.log(`   Remaining subtasks: ${remainingSubtasks}`);
    console.log(`   Remaining user tasks: ${remainingUserTasks}\n`);

    if (remainingTasks === 0 && remainingSubtasks === 0 && remainingUserTasks === 0) {
      console.log('=' .repeat(70));
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('=' .repeat(70));
      console.log('\n📋 Summary:');
      console.log(`   - Deleted ${taskResult.deletedCount} tasks`);
      console.log(`   - Deleted ${subtaskResult.deletedCount} subtasks`);
      console.log(`   - Deleted ${userTaskResult.deletedCount} user tasks`);
      console.log('\n✨ The Category system is now ready to be used!');
      console.log('   All new tasks will be created inside categories.\n');
    } else {
      console.log('⚠️  Warning: Some data may still remain. Please check manually.');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration Error:', error);
    console.error('\nStack trace:', error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Migration cancelled by user.');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (error) => {
  console.error('\n❌ Unhandled Promise Rejection:', error);
  await mongoose.connection.close();
  process.exit(1);
});

// Run migration
console.log('\n🚀 Starting migration script...\n');
migrateData();


