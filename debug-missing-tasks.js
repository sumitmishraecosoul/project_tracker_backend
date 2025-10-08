const mongoose = require('mongoose');
const Task = require('./models/Task');
const Project = require('./models/Project');

async function debugMissingTasks() {
  try {
    console.log('🔍 Debugging missing tasks issue...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=10000&socketTimeoutMS=10000');
    console.log('✅ Connected to MongoDB\n');
    
    // 1. Check total tasks in database
    const totalTasks = await Task.countDocuments();
    console.log(`📊 Total tasks in database: ${totalTasks}`);
    
    // 2. Check tasks by brand
    const tasksByBrand = await Task.aggregate([
      { $group: { _id: '$brand_id', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Tasks by brand:');
    tasksByBrand.forEach(brand => {
      console.log(`  Brand ${brand._id}: ${brand.count} tasks`);
    });
    
    // 3. Check tasks by project
    const tasksByProject = await Task.aggregate([
      { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Tasks by project:');
    tasksByProject.forEach(project => {
      console.log(`  Project ${project._id}: ${project.count} tasks`);
    });
    
    // 4. Check tasks by status
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Tasks by status:');
    tasksByStatus.forEach(status => {
      console.log(`  ${status._id}: ${status.count} tasks`);
    });
    
    // 5. Check for tasks with missing brand_id
    const tasksWithoutBrand = await Task.countDocuments({ brand_id: { $exists: false } });
    console.log(`\n⚠️  Tasks without brand_id: ${tasksWithoutBrand}`);
    
    // 6. Check for tasks with missing projectId
    const tasksWithoutProject = await Task.countDocuments({ projectId: { $exists: false } });
    console.log(`⚠️  Tasks without projectId: ${tasksWithoutProject}`);
    
    // 7. Check for tasks with null/undefined values
    const tasksWithNullBrand = await Task.countDocuments({ brand_id: null });
    const tasksWithNullProject = await Task.countDocuments({ projectId: null });
    console.log(`⚠️  Tasks with null brand_id: ${tasksWithNullBrand}`);
    console.log(`⚠️  Tasks with null projectId: ${tasksWithNullProject}`);
    
    // 8. Sample some recent tasks
    console.log('\n📋 Recent tasks (last 5):');
    const recentTasks = await Task.find({})
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.task} (Status: ${task.status}, Brand: ${task.brand_id}, Project: ${task.projectId?.title || task.projectId})`);
    });
    
    // 9. Check for tasks with different projectId formats
    console.log('\n🔍 ProjectId format analysis:');
    const projectIdFormats = await Task.aggregate([
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: [{ $type: '$projectId' }, 'ObjectId'] },
              then: 'ObjectId',
              else: { $type: '$projectId' }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    projectIdFormats.forEach(format => {
      console.log(`  ${format._id}: ${format.count} tasks`);
    });
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugMissingTasks();
