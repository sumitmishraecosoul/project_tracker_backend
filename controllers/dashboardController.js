const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const UserTask = require('../models/UserTask');
const Notification = require('../models/Notification');

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
      status: { $in: ['To Do', 'In Progress'] } 
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
  getTasksSummary
};
