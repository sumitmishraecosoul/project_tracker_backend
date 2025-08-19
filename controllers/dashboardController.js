const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const UserTask = require('../models/UserTask');
const Notification = require('../models/Notification');

// Get comprehensive dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    // Get counts
    const activeProjectsCount = await Project.countDocuments({ status: 'Active' });
    const totalTasksCount = await Task.countDocuments();
    const inProgressTasksCount = await Task.countDocuments({ status: 'In Progress' });
    const completedTasksCount = await Task.countDocuments({ status: 'Completed' });
    
    // Get total team members count (unique users across all projects)
    const totalTeamMembersCount = await Project.aggregate([
      { $unwind: '$teamMembers' },
      { $group: { _id: '$teamMembers.user' } },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    // Get recent projects (last 5)
    const recentProjects = await Project.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('_id title description status updatedAt')
      .lean();

    // Get task progress summary
    const taskProgress = {
      completed: completedTasksCount,
      inProgress: inProgressTasksCount,
      total: totalTasksCount
    };

    // Get additional stats for completeness
    const totalProjectsCount = await Project.countDocuments();
    const pendingTasksCount = await Task.countDocuments({ status: 'Yet to Start' });
    const overdueTasksCount = await Task.countDocuments({
      eta: { $lt: new Date() },
      status: { $ne: 'Completed' }
    });

    res.json({
      activeProjectsCount,
      totalTasksCount,
      inProgressTasksCount,
      completedTasksCount,
      totalTeamMembersCount,
      recentProjects,
      taskProgress,
      // Additional stats for comprehensive dashboard
      totalProjectsCount,
      pendingTasksCount,
      overdueTasksCount
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard summary',
      message: error.message 
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalUserTasks = await UserTask.countDocuments({ user: userId });
    
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ 
      status: { $in: ['Yet to Start', 'In Progress'] } 
    });
    
    const overdueTasks = await Task.countDocuments({
      eta: { $lt: new Date() },
      status: { $ne: 'Completed' }
    });

    res.json({
      totalProjects,
      totalTasks,
      totalUsers,
      totalUserTasks,
      activeProjects,
      completedTasks,
      pendingTasks,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get projects summary
const getProjectsSummary = async (req, res) => {
  try {
    const statusSummary = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const prioritySummary = await Project.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      statusSummary,
      prioritySummary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks summary
const getTasksSummary = async (req, res) => {
  try {
    const statusSummary = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const prioritySummary = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      statusSummary,
      prioritySummary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getProjectsSummary,
  getTasksSummary,
  getDashboardSummary
};
