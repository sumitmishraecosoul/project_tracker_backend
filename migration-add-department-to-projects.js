const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-tracker';

async function migrateProjectDepartments() {
  try {
    console.log('Starting migration: Adding department information to existing projects...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all projects that don't have a department field
    const projectsWithoutDepartment = await Project.find({ department: { $exists: false } });
    console.log(`Found ${projectsWithoutDepartment.length} projects without department information`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const project of projectsWithoutDepartment) {
      try {
        // Get the project creator's department
        const creator = await User.findById(project.createdBy);
        
        if (creator && creator.department) {
          // Update the project with the creator's department
          await Project.findByIdAndUpdate(project._id, {
            department: creator.department
          });
          
          console.log(`Updated project "${project.title}" with department: ${creator.department}`);
          updatedCount++;
        } else {
          console.warn(`Could not find creator or department for project "${project.title}" (ID: ${project._id})`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating project "${project.title}":`, error.message);
        errorCount++;
      }
    }

    console.log('\nMigration completed!');
    console.log(`Successfully updated: ${updatedCount} projects`);
    console.log(`Errors encountered: ${errorCount} projects`);

    // Verify the migration
    const remainingProjectsWithoutDepartment = await Project.find({ department: { $exists: false } });
    console.log(`Projects still without department: ${remainingProjectsWithoutDepartment.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateProjectDepartments();
}

module.exports = migrateProjectDepartments;
