const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Helper function to validate and convert user identifier to ObjectId
const validateAndGetUserId = async (userIdentifier) => {
  if (!userIdentifier) {
    throw new Error('User identifier is required');
  }

  // If it's already an ObjectId, validate it exists
  if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
    const user = await User.findById(userIdentifier);
    if (!user) {
      throw new Error('User not found with provided ID');
    }
    return userIdentifier;
  }

  // If it's an email, find user by email
  if (userIdentifier.includes('@')) {
    const user = await User.findOne({ email: userIdentifier.toLowerCase() });
    if (!user) {
      throw new Error('User not found with provided email');
    }
    return user._id;
  }

  // If it's a name, find user by name (case insensitive)
  const user = await User.findOne({ name: { $regex: new RegExp(userIdentifier, 'i') } });
  if (!user) {
    throw new Error('User not found with provided name');
  }
  return user._id;
};

// Utility: get all userIds in the same department as the given userId
const getDepartmentUserIds = async (department) => {
  const users = await User.find({ department, isActive: true }).select('_id');
  return users.map(u => u._id.toString());
};

// Permission checks
const canViewTask = async (user, task) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const assignedId = task.assignedTo?.toString();
  const reporterId = task.reporter?.toString();
  const userId = user._id?.toString() || user.id?.toString();
  if (assignedId === userId || reporterId === userId) return true;
  if (user.role === 'manager' || user.role === 'employee') {
    const deptUserIds = await getDepartmentUserIds(user.department);
    if (assignedId && deptUserIds.includes(assignedId)) return true;
    if (reporterId && deptUserIds.includes(reporterId)) return true;
    // Project-level permission: if project has participants in same department
    if (task.projectId) {
      let project = null;
      if (mongoose.Types.ObjectId.isValid(task.projectId)) {
        project = await Project.findById(task.projectId).select('createdBy teamMembers.user assignedTo department');
      }
      if (!project) {
        project = await Project.findOne({ title: task.projectId }).select('createdBy teamMembers.user assignedTo department');
      }
      if (project) {
        const createdById = project.createdBy?.toString();
        const projectAssignedIds = (project.assignedTo || []).map(id => id.toString());
        const projectTeamIds = (project.teamMembers || []).map(tm => tm.user?.toString());
        if (
          (createdById && deptUserIds.includes(createdById)) ||
          projectAssignedIds.some(id => deptUserIds.includes(id)) ||
          projectTeamIds.some(id => deptUserIds.includes(id)) ||
          project.department === user.department
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

// Check if a user can edit/delete a task
const canEditTask = async (user, task) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  const userId = user._id?.toString() || user.id?.toString();
  const reporterId = task.reporter?.toString();
  const assignedId = task.assignedTo?.toString();
  
  // Task reporter can always edit/delete
  if (reporterId === userId) return true;
  
  // Task assignee can edit/delete their own tasks
  if (assignedId === userId) return true;
  
  if (user.role === 'manager') {
    // Managers can edit/delete tasks from their own department
    // Check if task belongs to a project from their department
    if (task.projectId) {
      let project = null;
      if (mongoose.Types.ObjectId.isValid(task.projectId)) {
        project = await Project.findById(task.projectId).select('department');
      }
      if (!project) {
        project = await Project.findOne({ title: task.projectId }).select('department');
      }
      if (project && project.department === user.department) {
        return true;
      }
    }
    
    // Check if task is assigned to someone in their department
    const deptUserIds = await getDepartmentUserIds(user.department);
    if (assignedId && deptUserIds.includes(assignedId)) {
      return true;
    }
  }
  
  if (user.role === 'employee') {
    // Employees can only edit/delete tasks assigned to them or created by them
    if (assignedId === userId || reporterId === userId) {
      return true;
    }
  }
  
  return false;
};

exports.getAllTasks = async (req, res) => {
  try {
    const { status, taskType, view } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (taskType) {
      const normalizedTaskType = String(taskType).trim().toLowerCase();
      if (normalizedTaskType !== 'all' && normalizedTaskType !== 'all tasks') {
        filter.taskType = taskType;
      }
    }

    if (view) {
      const normalized = String(view).trim().toLowerCase();
      if (normalized === 'all' || normalized === 'all tasks') {
        // no-op
      } else if (normalized === 'pending' || normalized === 'pending tasks') {
        filter.status = { $in: ['Yet to Start', 'In Progress'] };
      } else if (normalized === 'inprogress' || normalized === 'in progress' || normalized === 'in progress task' || normalized === 'in progress tasks') {
        filter.status = 'In Progress';
      } else if (normalized === 'completed' || normalized === 'completed task' || normalized === 'completed tasks') {
        filter.status = 'Completed';
      }
    }

    // Set default department for admin (their own department or "All Departments")
    let selectedDepartment = req.query.department;
    if (req.user?.role === 'admin' && !selectedDepartment) {
      selectedDepartment = req.user.department || 'All Departments';
    }

    // RBAC filtering
    if (req.user.role === 'admin') {
      // Optional department scope for admins
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        const deptUserIds = await getDepartmentUserIds(selectedDepartment);
        filter.$and = (filter.$and || []);
        filter.$and.push({
          $or: [
            { assignedTo: { $in: deptUserIds } },
            { reporter: { $in: deptUserIds } }
          ]
        });
      }
    } else if (req.user.role === 'manager' || req.user.role === 'employee') {
      const deptUserIds = await getDepartmentUserIds(req.user.department);
      filter.$or = [
        { assignedTo: { $in: deptUserIds } },
        { reporter: { $in: deptUserIds } }
      ];
    } else {
      const me = req.user.id || req.user._id;
      filter.$or = [{ assignedTo: me }, { reporter: me }];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      message: err.message 
    });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email');
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'No task found with the provided ID' 
      });
    }
    const allowed = await canViewTask(req.user, task);
    if (!allowed) {
      return res.status(403).json({ error: 'Access denied', message: 'Not authorized to view this task' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(400).json({ 
      error: 'Failed to fetch task',
      message: err.message 
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { 
      projectId, 
      task, 
      description, 
      taskType, 
      priority, 
      status, 
      assignedTo, 
      reporter, 
      startDate, 
      eta, 
      estimatedHours, 
      remark, 
      roadBlock, 
      supportNeeded, 
      labels, 
      parentTask, 
      sprint 
    } = req.body;
    
    // Validate required fields
    if (!projectId || !task || !assignedTo || !reporter || !eta) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'projectId, task, assignedTo, reporter, and eta are required' 
      });
    }

    // Convert assignedTo and reporter to user IDs
    let assignedToId, reporterId;
    try {
      assignedToId = await validateAndGetUserId(assignedTo);
      reporterId = await validateAndGetUserId(reporter);
    } catch (userError) {
      return res.status(400).json({ 
        error: 'Invalid user reference',
        message: userError.message 
      });
    }

    // RBAC checks for creation
    const requesterId = (req.user.id || req.user._id).toString();
    const requesterRole = req.user.role;
    
    if (requesterRole === 'employee') {
      // Employees can create tasks but with department restrictions
      const assignee = await User.findById(assignedToId).select('department');
      const reporter = await User.findById(reporterId).select('department');
      
      // Employee can only assign to users in their own department
      if (assignee && assignee.department !== req.user.department) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only assign tasks to users in your department' 
        });
      }
      
      // Employee can only set reporter as themselves or users in their department
      if (reporter && reporter.department !== req.user.department) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only set reporter as yourself or users in your department' 
        });
      }
    } else if (requesterRole === 'manager') {
      // Managers can create tasks within their department
      const assignee = await User.findById(assignedToId).select('department');
      const reporter = await User.findById(reporterId).select('department');
      
      if (assignee && assignee.department !== req.user.department) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only assign tasks to users in your department' 
        });
      }
      
      if (reporter && reporter.department !== req.user.department) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only set reporter as users in your department' 
        });
      }
    }
    // Admin can create tasks for anyone (no restrictions)

    // Manager cross-department assignment -> force Adhoc
    let finalTaskType = taskType;
    if (requesterRole === 'manager') {
      const assignee = await User.findById(assignedToId).select('department');
      if (assignee && assignee.department && assignee.department !== req.user.department) {
        finalTaskType = 'Adhoc';
      }
    }
    
    const taskData = {
      projectId,
      task,
      description,
      taskType: finalTaskType,
      priority,
      status,
      assignedTo: assignedToId,
      reporter: reporterId,
      startDate: startDate ? new Date(startDate) : null,
      eta: new Date(eta),
      estimatedHours,
      remark,
      roadBlock,
      supportNeeded,
      labels: labels || [],
      parentTask,
      sprint
    };

    const newTask = await Task.create(taskData);
    
    // Populate user details before sending response
    await newTask.populate('assignedTo', 'name email');
    await newTask.populate('reporter', 'name email');
    
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    
    // Handle duplicate key errors specifically
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: 'Duplicate task ID',
        message: 'A task with this ID already exists. Please try again.' 
      });
    }
    
    res.status(400).json({ 
      error: 'Failed to create task',
      message: err.message 
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    // Fetch existing task to evaluate permissions and context
    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'No task found with the provided ID' 
      });
    }

    const canEdit = await canEditTask(req.user, existing);
    if (!canEdit) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Not authorized to update this task. Only admins, task reporters, and managers from the same department can edit tasks.' 
      });
    }

    const { 
      task, 
      description, 
      taskType, 
      priority, 
      status, 
      assignedTo, 
      reporter, 
      startDate, 
      eta, 
      estimatedHours, 
      actualHours, 
      remark, 
      roadBlock, 
      supportNeeded, 
      labels, 
      attachments, 
      relatedTasks, 
      parentTask, 
      sprint 
    } = req.body;
    
    const updateData = {};
    
    if (task !== undefined) updateData.task = task;
    if (description !== undefined) updateData.description = description;
    if (taskType !== undefined) updateData.taskType = taskType;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (eta !== undefined) updateData.eta = new Date(eta);
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (remark !== undefined) updateData.remark = remark;
    if (roadBlock !== undefined) updateData.roadBlock = roadBlock;
    if (supportNeeded !== undefined) updateData.supportNeeded = supportNeeded;
    if (labels !== undefined) updateData.labels = labels;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (relatedTasks !== undefined) updateData.relatedTasks = relatedTasks;
    if (parentTask !== undefined) updateData.parentTask = parentTask;
    if (sprint !== undefined) updateData.sprint = sprint;

    // Handle user ID conversion for assignedTo and reporter
    if (assignedTo !== undefined) {
      try {
        const newAssignedToId = await validateAndGetUserId(assignedTo);
        const userId = (req.user.id || req.user._id).toString();
        const userRole = req.user.role;
        
        // RBAC checks for reassignment
        if (userRole === 'employee') {
          // Employee can only reassign to users in their department
          const assignee = await User.findById(newAssignedToId).select('department');
          if (assignee && assignee.department !== req.user.department) {
            return res.status(403).json({ 
              error: 'Access denied', 
              message: 'You can only reassign tasks to users in your department' 
            });
          }
        } else if (userRole === 'manager') {
          // Manager can only reassign to users in their department
          const assignee = await User.findById(newAssignedToId).select('department');
          if (assignee && assignee.department !== req.user.department) {
            return res.status(403).json({ 
              error: 'Access denied', 
              message: 'You can only reassign tasks to users in your department' 
            });
          }
          // Manager cross-department reassignment -> force Adhoc
          if (assignee && assignee.department && assignee.department !== req.user.department) {
            updateData.taskType = 'Adhoc';
          }
        }
        // Admin can reassign to anyone (no restrictions)
        
        updateData.assignedTo = newAssignedToId;
      } catch (userError) {
        return res.status(400).json({ 
          error: 'Invalid assignedTo user reference',
          message: userError.message 
        });
      }
    }

    if (reporter !== undefined) {
      try {
        const newReporterId = await validateAndGetUserId(reporter);
        const userId = (req.user.id || req.user._id).toString();
        const userRole = req.user.role;
        
        // RBAC checks for reporter change
        if (userRole === 'employee') {
          // Employee can only set reporter as themselves or users in their department
          const reporter = await User.findById(newReporterId).select('department');
          if (reporter && reporter.department !== req.user.department) {
            return res.status(403).json({ 
              error: 'Access denied', 
              message: 'You can only set reporter as yourself or users in your department' 
            });
          }
        } else if (userRole === 'manager') {
          // Manager can only set reporter as users in their department
          const reporter = await User.findById(newReporterId).select('department');
          if (reporter && reporter.department !== req.user.department) {
            return res.status(403).json({ 
              error: 'Access denied', 
              message: 'You can only set reporter as users in your department' 
            });
          }
        }
        // Admin can set reporter to anyone (no restrictions)
        
        updateData.reporter = newReporterId;
      } catch (userError) {
        return res.status(400).json({ 
          error: 'Invalid reporter user reference',
          message: userError.message 
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email').populate('reporter', 'name email');
    
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    
    // Handle duplicate key errors specifically
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: 'Duplicate task ID',
        message: 'A task with this ID already exists. Please try again.' 
      });
    }
    
    res.status(400).json({ 
      error: 'Failed to update task',
      message: err.message 
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'No task found with the provided ID' 
      });
    }
    const canDelete = await canEditTask(req.user, task);
    if (!canDelete) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Not authorized to delete this task. Only admins, task reporters, and managers from the same department can delete tasks.' 
      });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ 
      message: 'Task deleted successfully',
      deletedTaskId: task.id 
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(400).json({ 
      error: 'Failed to delete task',
      message: err.message 
    });
  }
};
