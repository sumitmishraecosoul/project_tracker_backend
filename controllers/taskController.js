const Task = require('../models/Task');
const User = require('../models/User');
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
    
    const taskData = {
      projectId,
      task,
      description,
      taskType,
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
        updateData.assignedTo = await validateAndGetUserId(assignedTo);
      } catch (userError) {
        return res.status(400).json({ 
          error: 'Invalid assignedTo user reference',
          message: userError.message 
        });
      }
    }

    if (reporter !== undefined) {
      try {
        updateData.reporter = await validateAndGetUserId(reporter);
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
    
    if (!updatedTask) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'No task found with the provided ID' 
      });
    }
    
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
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'No task found with the provided ID' 
      });
    }
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
