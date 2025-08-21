const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const UserTask = require('../models/UserTask');
const Notification = require('../models/Notification');

// Utility: department user ids
const getDepartmentUserIds = async (department) => {
  const users = await User.find({ department, isActive: true }).select('_id');
  return users.map(u => u._id.toString());
};

// Get comprehensive dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const user = req.user;
    const userId = (user?.id || user?._id)?.toString();
    let selectedDepartment = req.query.department;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User authentication required' 
      });
    }

    const projectFilter = {};
    const taskFilter = {};
    const teamFilter = {};

    // Set default department for admin (their own department or "All Departments")
    if (user.role === 'admin' && !selectedDepartment) {
      selectedDepartment = user.department || 'All Departments';
    }

    // Apply department filtering based on user role and selected department
    if (user.role === 'admin') {
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        const deptIds = await getDepartmentUserIds(selectedDepartment);
        projectFilter.$or = [
          { createdBy: { $in: deptIds } },
          { assignedTo: { $in: deptIds } },
          { 'teamMembers.user': { $in: deptIds } }
        ];
        taskFilter.$or = [
          { assignedTo: { $in: deptIds } },
          { reporter: { $in: deptIds } }
        ];
        teamFilter.department = selectedDepartment;
      }
    } else if (user.role === 'manager') {
      // Managers can only see their department's data
      const deptIds = await getDepartmentUserIds(user.department);
      projectFilter.$or = [
        { createdBy: { $in: deptIds } },
        { assignedTo: { $in: deptIds } },
        { 'teamMembers.user': { $in: deptIds } }
      ];
      taskFilter.$or = [
        { assignedTo: { $in: deptIds } },
        { reporter: { $in: deptIds } }
      ];
      teamFilter.department = user.department;
    } else {
      // Employees can only see their own data
      projectFilter.$or = [
        { createdBy: userId },
        { assignedTo: { $in: [userId] } },
        { 'teamMembers.user': userId }
      ];
      taskFilter.$or = [
        { assignedTo: userId },
        { reporter: userId }
      ];
      teamFilter.department = user.department;
    }

    // Get counts
    const activeProjectsCount = await Project.countDocuments({ status: 'Active', ...projectFilter });
    const totalTasksCount = await Task.countDocuments(taskFilter);
    const inProgressTasksCount = await Task.countDocuments({ status: 'In Progress', ...taskFilter });
    const completedTasksCount = await Task.countDocuments({ status: 'Completed', ...taskFilter });
    
    // Get total team members count (department-based)
    let totalTeamMembersCount = 0;
    if (user.role === 'admin') {
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        totalTeamMembersCount = await User.countDocuments({ department: selectedDepartment, isActive: true });
      } else {
        totalTeamMembersCount = await User.countDocuments({ isActive: true });
      }
    } else {
      totalTeamMembersCount = await User.countDocuments({ department: user.department, isActive: true });
    }

    // Get recent projects with department info and active member count
    const recentProjects = await Project.find(projectFilter)
      .populate('createdBy', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('teamMembers.user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    // Add department info and active member count to each project
    const projectsWithDetails = recentProjects.map(project => {
      const allMembers = [
        ...(project.assignedTo || []),
        ...(project.teamMembers || []).map(tm => tm.user).filter(Boolean)
      ];
      
      // Count unique active members with null safety
      const uniqueMemberIds = [...new Set(allMembers.map(member => {
        if (!member) return null;
        return typeof member === 'object' && member._id ? member._id.toString() : member.toString();
      }).filter(Boolean))];
      
      const activeMembersCount = uniqueMemberIds.length;
      
      return {
        ...project,
        department: project.createdBy?.department || 'Unknown',
        activeMembersCount,
        createdByDepartment: project.createdBy?.department || 'Unknown'
      };
    });

    // Get team members for the selected department
    const teamMembers = await User.find(teamFilter)
      .select('name email role department')
      .sort({ name: 1 })
      .limit(4)
      .lean();

    // Get task progress summary
    const taskProgress = {
      completed: completedTasksCount,
      inProgress: inProgressTasksCount,
      total: totalTasksCount
    };

    // Get additional stats for completeness
    const totalProjectsCount = await Project.countDocuments(projectFilter);
    const pendingTasksCount = await Task.countDocuments({ status: 'Yet to Start', ...taskFilter });
    const overdueTasksCount = await Task.countDocuments({
      eta: { $lt: new Date() },
      status: { $ne: 'Completed' },
      ...taskFilter
    });

    res.json({
      activeProjectsCount,
      totalTasksCount,
      inProgressTasksCount,
      completedTasksCount,
      totalTeamMembersCount,
      recentProjects: projectsWithDetails,
      teamMembers,
      taskProgress,
      // Additional stats for comprehensive dashboard
      totalProjectsCount,
      pendingTasksCount,
      overdueTasksCount,
      selectedDepartment: selectedDepartment || (user.role === 'admin' ? 'All Departments' : user.department)
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
    const user = req.user;
    const userId = (user?.id || user?._id)?.toString();
    let selectedDepartment = req.query.department;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User authentication required' 
      });
    }

    const projectFilter = {};
    const taskFilter = {};
    
    // Set default department for admin (their own department or "All Departments")
    if (user.role === 'admin' && !selectedDepartment) {
      selectedDepartment = user.department || 'All Departments';
    }
    
    if (user.role === 'admin') {
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        const deptIds = await getDepartmentUserIds(selectedDepartment);
        projectFilter.$or = [
          { createdBy: { $in: deptIds } },
          { assignedTo: { $in: deptIds } },
          { 'teamMembers.user': { $in: deptIds } }
        ];
        taskFilter.$or = [
          { assignedTo: { $in: deptIds } },
          { reporter: { $in: deptIds } }
        ];
      }
    } else if (user.role === 'manager') {
      const deptIds = await getDepartmentUserIds(user.department);
      projectFilter.$or = [
        { createdBy: { $in: deptIds } },
        { assignedTo: { $in: deptIds } },
        { 'teamMembers.user': { $in: deptIds } }
      ];
      taskFilter.$or = [
        { assignedTo: { $in: deptIds } },
        { reporter: { $in: deptIds } }
      ];
    } else {
      projectFilter.$or = [
        { createdBy: userId },
        { assignedTo: { $in: [userId] } },
        { 'teamMembers.user': userId }
      ];
      taskFilter.$or = [
        { assignedTo: userId },
        { reporter: userId }
      ];
    }

    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const totalUsers = await User.countDocuments();
    const totalUserTasks = await UserTask.countDocuments({ user: userId });
    const activeProjects = await Project.countDocuments({ status: 'Active', ...projectFilter });
    const completedTasks = await Task.countDocuments({ status: 'Completed', ...taskFilter });
    const pendingTasks = await Task.countDocuments({ 
      status: { $in: ['Yet to Start', 'In Progress'] },
      ...taskFilter
    });
    const overdueTasks = await Task.countDocuments({
      eta: { $lt: new Date() },
      status: { $ne: 'Completed' },
      ...taskFilter
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
    const user = req.user;
    const selectedDepartment = req.query.department;
    
    let matchStage = {};
    
    if (user.role !== 'admin') {
      if (user.role === 'manager') {
        const deptIds = await getDepartmentUserIds(user.department);
        matchStage.$or = [
          { createdBy: { $in: deptIds } },
          { assignedTo: { $in: deptIds } },
          { 'teamMembers.user': { $in: deptIds } }
        ];
      } else {
        const userId = (user.id || user._id).toString();
        matchStage.$or = [
          { createdBy: userId },
          { assignedTo: { $in: [userId] } },
          { 'teamMembers.user': userId }
        ];
      }
    } else if (selectedDepartment && selectedDepartment !== 'All Departments') {
      const deptIds = await getDepartmentUserIds(selectedDepartment);
      matchStage.$or = [
        { createdBy: { $in: deptIds } },
        { assignedTo: { $in: deptIds } },
        { 'teamMembers.user': { $in: deptIds } }
      ];
    }

    const statusSummary = await Project.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const prioritySummary = await Project.aggregate([
      { $match: matchStage },
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
    const user = req.user;
    const selectedDepartment = req.query.department;
    
    let matchStage = {};
    
    if (user.role !== 'admin') {
      if (user.role === 'manager') {
        const deptIds = await getDepartmentUserIds(user.department);
        matchStage.$or = [
          { assignedTo: { $in: deptIds } },
          { reporter: { $in: deptIds } }
        ];
      } else {
        const userId = (user.id || user._id).toString();
        matchStage.$or = [
          { assignedTo: userId },
          { reporter: userId }
        ];
      }
    } else if (selectedDepartment && selectedDepartment !== 'All Departments') {
      const deptIds = await getDepartmentUserIds(selectedDepartment);
      matchStage.$or = [
        { assignedTo: { $in: deptIds } },
        { reporter: { $in: deptIds } }
      ];
    }

    const statusSummary = await Task.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const prioritySummary = await Task.aggregate([
      { $match: matchStage },
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

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = [
      'Supply Chain-Operations',
      'Human Resources and Administration',
      'New Product Design',
      'India E-commerce',
      'Supply Chain',
      'Data Analytics',
      'E-commerce',
      'Retail E-commerce',
      'Finance & Accounts',
      'Zonal Sales (India)- HORECA',
      'Zonal Sales (India)',
      'Supply Chain & Operation',
      'Zonal Sales',
      'Digital Marketing'
    ];

    res.json({
      departments,
      userDepartment: req.user?.department || null,
      userRole: req.user?.role || null
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch departments',
      message: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getProjectsSummary,
  getTasksSummary,
  getDashboardSummary,
  getAllDepartments
};
