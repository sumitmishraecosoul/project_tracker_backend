const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const Task = require('./models/Task');
const Project = require('./models/Project');

const standardizeProjectIds = async () => {
  try {
    console.log('Starting project ID standardization migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all tasks with string projectId values
    const tasksWithStringProjectIds = await Task.find({
      projectId: { $type: 'string' }
    });

    console.log(`Found ${tasksWithStringProjectIds.length} tasks with string projectId values`);

    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const task of tasksWithStringProjectIds) {
      try {
        // Try to find a project with matching title
        const project = await Project.findOne({ 
          title: { $regex: new RegExp(`^${task.projectId}$`, 'i') } 
        });

        if (project) {
          // Update the task with the proper ObjectId
          await Task.findByIdAndUpdate(task._id, { 
            projectId: project._id.toString() 
          });
          console.log(`✓ Updated task ${task.id}: "${task.projectId}" -> "${project.title}" (${project._id})`);
          updatedCount++;
        } else {
          console.warn(`⚠ Task ${task.id}: No project found with title "${task.projectId}"`);
          errors.push(`Task ${task.id}: No project found with title "${task.projectId}"`);
          errorCount++;
        }
      } catch (error) {
        console.error(`✗ Error processing task ${task.id}:`, error.message);
        errors.push(`Task ${task.id}: ${error.message}`);
        errorCount++;
      }
    }

    // Also check for tasks with ObjectId projectId that might need string conversion
    const tasksWithObjectIdProjectIds = await Task.find({
      projectId: { $type: 'objectId' }
    });

    console.log(`Found ${tasksWithObjectIdProjectIds.length} tasks with ObjectId projectId values`);

    // Verify that all ObjectId references are valid
    for (const task of tasksWithObjectIdProjectIds) {
      try {
        const project = await Project.findById(task.projectId);
        if (!project) {
          console.warn(`⚠ Task ${task.id}: Invalid ObjectId reference "${task.projectId}" - no project found`);
          errors.push(`Task ${task.id}: Invalid ObjectId reference "${task.projectId}"`);
          errorCount++;
        }
      } catch (error) {
        console.error(`✗ Error verifying task ${task.id}:`, error.message);
        errors.push(`Task ${task.id}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total tasks with string projectId: ${tasksWithStringProjectIds.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Total tasks with ObjectId projectId: ${tasksWithObjectIdProjectIds.length}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(error => console.log(error));
    }

    console.log('\nProject ID standardization completed!');
    console.log('\nRecommendation: After this migration, consider updating your task creation logic');
    console.log('to always use ObjectId references for projectId to prevent future inconsistencies.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  standardizeProjectIds();
}

module.exports = standardizeProjectIds;
