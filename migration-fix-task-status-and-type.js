const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Task = require('./models/Task');

const migrateTaskStatusAndType = async () => {
  try {
    console.log('Starting migration: normalize Task status and taskType...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1) Status: "To Do" -> "Yet to Start"
    const statusRenameResult = await Task.updateMany(
      { status: 'To Do' },
      { $set: { status: 'Yet to Start' } }
    );
    console.log(`Status rename: To Do -> Yet to Start | matched: ${statusRenameResult.matchedCount || statusRenameResult.n}, modified: ${statusRenameResult.modifiedCount || statusRenameResult.nModified}`);

    // Note: New status "Cancelled" is allowed by schema; no data change required unless desired.

    // 2) taskType: map legacy types to new frequency types if desired
    // If you want a one-time default mapping, uncomment and adjust below.
    const typeMappings = [
      { from: 'Feature', to: 'Adhoc' },
      { from: 'Bug', to: 'Adhoc' },
      { from: 'Enhancement', to: 'Adhoc' },
      { from: 'Documentation', to: 'Adhoc' },
      { from: 'Research', to: 'Adhoc' }
    ];

    for (const map of typeMappings) {
      const res = await Task.updateMany(
        { taskType: map.from },
        { $set: { taskType: map.to } }
      );
      if ((res.matchedCount || res.n) > 0) {
        console.log(`TaskType normalize: ${map.from} -> ${map.to} | matched: ${res.matchedCount || res.n}, modified: ${res.modifiedCount || res.nModified}`);
      }
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

if (require.main === module) {
  migrateTaskStatusAndType();
}

module.exports = migrateTaskStatusAndType;


