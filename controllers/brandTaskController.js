const mongoose = require('mongoose');
const Task = require('../models/Task');
const TaskSection = require('../models/TaskSection');
const TaskDependency = require('../models/TaskDependency');
const TaskStatusWorkflow = require('../models/TaskStatusWorkflow');
const TaskPrioritySystem = require('../models/TaskPrioritySystem');
const Project = require('../models/Project');
const User = require('../models/User');

// Get all tasks for a specific brand
const getBrandTasks = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page, limit, status, priority, assignedTo, projectId, sectionId, search } = req.query;

    // Build query with brand filter
    let query = { brand_id: brandId };

    // Apply additional filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (projectId) {
      query.projectId = projectId;
    }
    if (sectionId) {
      query.section_id = sectionId;
    }
    if (search) {
      query.$or = [
        { task: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalTasks = await Task.countDocuments(query);

    // Build the query
    let taskQuery = Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('projectId', 'title')
      .populate('section_id', 'name')
      .sort({ createdAt: -1 });

    // Apply pagination only if limit is specified
    if (limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      taskQuery = taskQuery.skip(skip).limit(limitNum);
      
      const tasks = await taskQuery;
      
      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalTasks / limitNum),
            totalTasks,
            hasNextPage: skip + tasks.length < totalTasks,
            hasPrevPage: pageNum > 1
          }
        },
        message: 'Brand tasks retrieved successfully'
      });
    } else {
      // No pagination - return all tasks
      const tasks = await taskQuery;
      
      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalTasks,
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        message: 'Brand tasks retrieved successfully'
      });
    }
  } catch (error) {
    console.error('Error fetching brand tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_TASKS_FETCH_ERROR',
        message: 'Failed to fetch brand tasks',
        details: error.message
      }
    });
  }
};

// Get task details within a brand
const getBrandTaskById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    // Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOne({ _id: id, brand_id: brandId })
        .populate('assignedTo', 'name email')
        .populate('reporter', 'name email')
        .populate('projectId', 'title')
        .populate('section_id', 'name')
        .populate('createdBy', 'name email');
    }
    
    if (!task) {
      task = await Task.findOne({ id: id, brand_id: brandId })
        .populate('assignedTo', 'name email')
        .populate('reporter', 'name email')
        .populate('projectId', 'title')
        .populate('section_id', 'name')
        .populate('createdBy', 'name email');
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    // Get task dependencies (use task._id for ObjectId)
    const dependencies = await TaskDependency.getTaskDependencies(task._id, brandId);
    const dependentTasks = await TaskDependency.getDependentTasks(task._id, brandId);

    res.json({
      success: true,
      data: {
        task,
        dependencies,
        dependentTasks
      },
      message: 'Brand task details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand task details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_TASK_FETCH_ERROR',
        message: 'Failed to fetch brand task details',
        details: error.message
      }
    });
  }
};

// Create task within a brand
const createBrandTask = async (req, res) => {
  try {
    const { brandId } = req.params;
    const taskData = {
      ...req.body,
      brand_id: brandId,
      createdBy: req.user.id
    };

    // Validate required fields
    if (!taskData.task || !taskData.projectId || !taskData.category_id || !taskData.assignedTo || !taskData.reporter || !taskData.eta) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Task, projectId, category_id, assignedTo, reporter, and eta are required'
        }
      });
    }

    // Validate category_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskData.category_id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid category_id. Please provide a valid category ID.'
        }
      });
    }

    // Validate assignedTo is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskData.assignedTo)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid assignedTo user ID. Please provide a valid user ID, not a username.'
        }
      });
    }

    // Validate reporter is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskData.reporter)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid reporter user ID. Please provide a valid user ID, not a username.'
        }
      });
    }

    // Generate unique task ID if not provided
    if (!taskData.id) {
      // Use timestamp-based ID to ensure uniqueness
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 5).toUpperCase();
      taskData.id = `TASK-${timestamp}-${randomSuffix}`;
    }

    // Create task
    const task = await Task.create(taskData);

    // Populate the created task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('projectId', 'title')
      .populate('section_id', 'name');

    res.status(201).json({
      success: true,
      data: populatedTask,
      message: 'Brand task created successfully'
    });
  } catch (error) {
    console.error('Error creating brand task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_TASK_CREATE_ERROR',
        message: 'Failed to create brand task',
        details: error.message
      }
    });
  }
};

// Update task within a brand
const updateBrandTask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    // Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOne({ _id: id, brand_id: brandId });
    }
    
    if (!task) {
      task = await Task.findOne({ id: id, brand_id: brandId });
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    // Filter out null/undefined values to prevent validation errors
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== null && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    // Handle dependencies separately if provided
    if (req.body.dependencies !== undefined) {
      // Validate dependencies are valid ObjectIds
      const dependencies = Array.isArray(req.body.dependencies) ? req.body.dependencies : [];
      const validDependencies = dependencies.filter(dep => 
        mongoose.Types.ObjectId.isValid(dep)
      );
      
      // Check for self-dependency
      const selfDependency = validDependencies.some(dep => 
        dep.toString() === task._id.toString()
      );
      
      if (selfDependency) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Task cannot depend on itself'
          }
        });
      }
      
      updateData.dependencies = validDependencies;
    }

    // Update task using the found task's _id
    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email')
     .populate('projectId', 'title')
     .populate('section_id', 'name')
     .populate('dependencies', 'id task status priority');

    res.json({
      success: true,
      data: updatedTask,
      message: 'Brand task updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_TASK_UPDATE_ERROR',
        message: 'Failed to update brand task',
        details: error.message
      }
    });
  }
};

// Delete task within a brand
const deleteBrandTask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    // Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOne({ _id: id, brand_id: brandId });
    }
    
    if (!task) {
      task = await Task.findOne({ id: id, brand_id: brandId });
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    // Delete associated dependencies
    await TaskDependency.deleteMany({ 
      $or: [
        { task_id: task._id, brand_id: brandId },
        { depends_on_task_id: task._id, brand_id: brandId }
      ]
    });

    // Delete task
    await Task.findByIdAndDelete(task._id);

    res.json({
      success: true,
      message: 'Brand task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_TASK_DELETE_ERROR',
        message: 'Failed to delete brand task',
        details: error.message
      }
    });
  }
};

// Get tasks for a specific project within a brand
const getBrandProjectTasks = async (req, res) => {
  try {
    const { brandId, projectId } = req.params;
    const { status, priority, assignedTo, sectionId } = req.query;

    let query = { projectId, brand_id: brandId };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (sectionId) {
      query.section_id = sectionId;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('section_id', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
      message: 'Brand project tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand project tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECT_TASKS_FETCH_ERROR',
        message: 'Failed to fetch brand project tasks',
        details: error.message
      }
    });
  }
};

// Assign task to user
const assignTask = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'assignedTo is required'
        }
      });
    }

    // Validate that assignedTo is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'assignedTo must be a valid ObjectId'
        }
      });
    }

    // Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOneAndUpdate(
        { _id: id, brand_id: brandId },
        { assignedTo },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');
    }
    
    if (!task) {
      task = await Task.findOneAndUpdate(
        { id: id, brand_id: brandId },
        { assignedTo },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_ASSIGN_ERROR',
        message: 'Failed to assign task',
        details: error.message
      }
    });
  }
};

// Unassign task from user
const unassignTask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { assignedTo: null },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task unassigned successfully'
    });
  } catch (error) {
    console.error('Error unassigning task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_UNASSIGN_ERROR',
        message: 'Failed to unassign task',
        details: error.message
      }
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        }
      });
    }

    const validStatuses = ['Yet to Start', 'In Progress', 'Under Review', 'Completed', 'Blocked', 'On Hold', 'Cancelled', 'Recurring'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        }
      });
    }

    // Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOneAndUpdate(
        { _id: id, brand_id: brandId },
        { status },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }
    
    if (!task) {
      task = await Task.findOneAndUpdate(
        { id: id, brand_id: brandId },
        { status },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_STATUS_UPDATE_ERROR',
        message: 'Failed to update task status',
        details: error.message
      }
    });
  }
};

// Update task priority
const updateTaskPriority = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Priority is required'
        }
      });
    }

    const validPriorities = ['Critical', 'High', 'Medium', 'Low'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ')
        }
      });
    }

    // Check if id is a valid ObjectId, otherwise search by id field
    let task;
    if (mongoose.Types.ObjectId.isValid(id)) {
      task = await Task.findOneAndUpdate(
        { _id: id, brand_id: brandId },
        { priority },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }
    
    if (!task) {
      task = await Task.findOneAndUpdate(
        { id: id, brand_id: brandId },
        { priority },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email')
       .populate('reporter', 'name email');
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task priority updated successfully'
    });
  } catch (error) {
    console.error('Error updating task priority:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_PRIORITY_UPDATE_ERROR',
        message: 'Failed to update task priority',
        details: error.message
      }
    });
  }
};

// Task sections management
const getTaskSections = async (req, res) => {
  try {
    const { brandId, projectId } = req.params;

    const sections = await TaskSection.getSectionsByProject(projectId, brandId);

    res.json({
      success: true,
      data: sections,
      message: 'Task sections retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching task sections:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SECTIONS_FETCH_ERROR',
        message: 'Failed to fetch task sections',
        details: error.message
      }
    });
  }
};

const createTaskSection = async (req, res) => {
  try {
    const { brandId, projectId } = req.params;
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Section name is required'
        }
      });
    }

    const section = await TaskSection.create({
      brand_id: brandId,
      project_id: projectId,
      name,
      description,
      color,
      icon,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: section,
      message: 'Task section created successfully'
    });
  } catch (error) {
    console.error('Error creating task section:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SECTION_CREATE_ERROR',
        message: 'Failed to create task section',
        details: error.message
      }
    });
  }
};

const updateTaskSection = async (req, res) => {
  try {
    const { brandId, sectionId } = req.params;

    const section = await TaskSection.findOneAndUpdate(
      { _id: sectionId, brand_id: brandId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SECTION_NOT_FOUND',
          message: 'Section not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: section,
      message: 'Task section updated successfully'
    });
  } catch (error) {
    console.error('Error updating task section:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SECTION_UPDATE_ERROR',
        message: 'Failed to update task section',
        details: error.message
      }
    });
  }
};

const deleteTaskSection = async (req, res) => {
  try {
    const { brandId, sectionId } = req.params;

    const section = await TaskSection.findOneAndDelete({
      _id: sectionId,
      brand_id: brandId
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SECTION_NOT_FOUND',
          message: 'Section not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      message: 'Task section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task section:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SECTION_DELETE_ERROR',
        message: 'Failed to delete task section',
        details: error.message
      }
    });
  }
};

// Task dependencies management
const getTaskDependencies = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const dependencies = await TaskDependency.getTaskDependencies(id, brandId);
    const dependentTasks = await TaskDependency.getDependentTasks(id, brandId);

    res.json({
      success: true,
      data: {
        dependencies,
        dependentTasks
      },
      message: 'Task dependencies retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_DEPENDENCIES_FETCH_ERROR',
        message: 'Failed to fetch task dependencies',
        details: error.message
      }
    });
  }
};

const addTaskDependency = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { depends_on_task_id, dependency_type, lag_days, notes } = req.body;

    if (!depends_on_task_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'depends_on_task_id is required'
        }
      });
    }

    // Check for circular dependency
    const hasCircularDependency = await TaskDependency.checkCircularDependency(
      id, 
      depends_on_task_id, 
      brandId
    );

    if (hasCircularDependency) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CIRCULAR_DEPENDENCY',
          message: 'Circular dependency detected'
        }
      });
    }

    const dependency = await TaskDependency.create({
      brand_id: brandId,
      task_id: id,
      depends_on_task_id,
      dependency_type,
      lag_days,
      notes,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: dependency,
      message: 'Task dependency added successfully'
    });
  } catch (error) {
    console.error('Error adding task dependency:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_DEPENDENCY_ADD_ERROR',
        message: 'Failed to add task dependency',
        details: error.message
      }
    });
  }
};

const removeTaskDependency = async (req, res) => {
  try {
    const { brandId, id, dependencyId } = req.params;

    const dependency = await TaskDependency.findOneAndDelete({
      _id: dependencyId,
      task_id: id,
      brand_id: brandId
    });

    if (!dependency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPENDENCY_NOT_FOUND',
          message: 'Dependency not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Task dependency removed successfully'
    });
  } catch (error) {
    console.error('Error removing task dependency:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_DEPENDENCY_REMOVE_ERROR',
        message: 'Failed to remove task dependency',
        details: error.message
      }
    });
  }
};

// Task status workflow management
const getStatusWorkflow = async (req, res) => {
  try {
    const { brandId } = req.params;

    const workflow = await TaskStatusWorkflow.getDefaultWorkflow(brandId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: 'No status workflow found for this brand'
        }
      });
    }

    res.json({
      success: true,
      data: workflow,
      message: 'Status workflow retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching status workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_WORKFLOW_FETCH_ERROR',
        message: 'Failed to fetch status workflow',
        details: error.message
      }
    });
  }
};

const updateStatusWorkflow = async (req, res) => {
  try {
    const { brandId } = req.params;

    const workflow = await TaskStatusWorkflow.findOneAndUpdate(
      { brand_id: brandId, is_default: true },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      data: workflow,
      message: 'Status workflow updated successfully'
    });
  } catch (error) {
    console.error('Error updating status workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_WORKFLOW_UPDATE_ERROR',
        message: 'Failed to update status workflow',
        details: error.message
      }
    });
  }
};

// Task priority system management
const getPrioritySystem = async (req, res) => {
  try {
    const { brandId } = req.params;

    const prioritySystem = await TaskPrioritySystem.getDefaultPrioritySystem(brandId);

    if (!prioritySystem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRIORITY_SYSTEM_NOT_FOUND',
          message: 'No priority system found for this brand'
        }
      });
    }

    res.json({
      success: true,
      data: prioritySystem,
      message: 'Priority system retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching priority system:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRIORITY_SYSTEM_FETCH_ERROR',
        message: 'Failed to fetch priority system',
        details: error.message
      }
    });
  }
};

const updatePrioritySystem = async (req, res) => {
  try {
    const { brandId } = req.params;

    const prioritySystem = await TaskPrioritySystem.findOneAndUpdate(
      { brand_id: brandId, is_default: true },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      data: prioritySystem,
      message: 'Priority system updated successfully'
    });
  } catch (error) {
    console.error('Error updating priority system:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRIORITY_SYSTEM_UPDATE_ERROR',
        message: 'Failed to update priority system',
        details: error.message
      }
    });
  }
};

// Task analytics
const getTaskAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Get task statistics by status
    const statusStats = await Task.aggregate([
      { $match: { brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get task statistics by priority
    const priorityStats = await Task.aggregate([
      { $match: { brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get task statistics by assignee
    const assigneeStats = await Task.aggregate([
      { $match: { brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        priorityStats,
        assigneeStats
      },
      message: 'Task analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch task analytics',
        details: error.message
      }
    });
  }
};

const getTaskAnalyticsById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const task = await Task.findOne({ _id: id, brand_id: brandId });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: 'Task not found in this brand'
        }
      });
    }

    // Get task dependencies
    const dependencies = await TaskDependency.getTaskDependencies(id, brandId);
    const dependentTasks = await TaskDependency.getDependentTasks(id, brandId);

    res.json({
      success: true,
      data: {
        task,
        dependencies,
        dependentTasks
      },
      message: 'Task analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch task analytics',
        details: error.message
      }
    });
  }
};

// Task search and filtering
const searchTasks = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required'
        }
      });
    }

    const query = {
      brand_id: brandId,
      $or: [
        { task: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTasks / parseInt(limit)),
          totalTasks,
          hasNextPage: skip + tasks.length < totalTasks,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Task search completed successfully'
    });
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SEARCH_ERROR',
        message: 'Failed to search tasks',
        details: error.message
      }
    });
  }
};

const filterTasks = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { status, priority, assignedTo, projectId, sectionId, page = 1, limit = 10 } = req.query;

    let query = { brand_id: brandId };

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (projectId) {
      query.projectId = projectId;
    }
    if (sectionId) {
      query.section_id = sectionId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('projectId', 'title')
      .populate('section_id', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTasks / parseInt(limit)),
          totalTasks,
          hasNextPage: skip + tasks.length < totalTasks,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Task filtering completed successfully'
    });
  } catch (error) {
    console.error('Error filtering tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_FILTER_ERROR',
        message: 'Failed to filter tasks',
        details: error.message
      }
    });
  }
};

// ==================== TASK LINKS MANAGEMENT ====================

const getTaskLinks = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRAND_ID', message: 'Invalid brand ID provided' }
      });
    }

    if (!taskId || taskId === 'undefined' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Invalid task ID provided' }
      });
    }

    // Verify task exists and user has access
    const task = await Task.findOne({ _id: taskId, brand_id: brandId });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
      });
    }

    const TaskLink = require('../models/TaskLink');
    const links = await TaskLink.getTaskLinks(taskId, brandId);

    res.status(200).json({
      success: true,
      data: links.map(link => link.getFormattedData()),
      message: 'Task links retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching task links:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_LINKS_ERROR',
        message: 'Failed to fetch task links',
        details: error.message
      }
    });
  }
};

const createTaskLink = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;
    const { name, url, description } = req.body;

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRAND_ID', message: 'Invalid brand ID provided' }
      });
    }

    if (!taskId || taskId === 'undefined' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Invalid task ID provided' }
      });
    }

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and URL are required' }
      });
    }

    // Verify task exists and user has access
    const task = await Task.findOne({ _id: taskId, brand_id: brandId });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
      });
    }

    const TaskLink = require('../models/TaskLink');
    
    // Get the next order number
    const lastLink = await TaskLink.findOne({ task_id: taskId, brand_id: brandId })
      .sort('-order');
    const nextOrder = lastLink ? lastLink.order + 1 : 0;

    const taskLink = new TaskLink({
      task_id: taskId,
      brand_id: brandId,
      name: name.trim(),
      url: url.trim(),
      description: description ? description.trim() : '',
      order: nextOrder,
      created_by: req.user.id
    });

    await taskLink.save();
    await taskLink.populate('created_by', 'name email');

    res.status(201).json({
      success: true,
      data: taskLink.getFormattedData(),
      message: 'Task link created successfully'
    });

  } catch (error) {
    console.error('Error creating task link:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_LINK_CREATE_ERROR',
        message: 'Failed to create task link',
        details: error.message
      }
    });
  }
};

const updateTaskLink = async (req, res) => {
  try {
    const { brandId, taskId, linkId } = req.params;
    const { name, url, description } = req.body;

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRAND_ID', message: 'Invalid brand ID provided' }
      });
    }

    if (!taskId || taskId === 'undefined' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Invalid task ID provided' }
      });
    }

    if (!linkId || linkId === 'undefined' || !mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_LINK_ID', message: 'Invalid link ID provided' }
      });
    }

    const TaskLink = require('../models/TaskLink');
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (url !== undefined) updateData.url = url.trim();
    if (description !== undefined) updateData.description = description.trim();

    const taskLink = await TaskLink.findOneAndUpdate(
      { _id: linkId, task_id: taskId, brand_id: brandId },
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by', 'name email');

    if (!taskLink) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_LINK_NOT_FOUND', message: 'Task link not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: taskLink.getFormattedData(),
      message: 'Task link updated successfully'
    });

  } catch (error) {
    console.error('Error updating task link:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_LINK_UPDATE_ERROR',
        message: 'Failed to update task link',
        details: error.message
      }
    });
  }
};

const deleteTaskLink = async (req, res) => {
  try {
    const { brandId, taskId, linkId } = req.params;

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRAND_ID', message: 'Invalid brand ID provided' }
      });
    }

    if (!taskId || taskId === 'undefined' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Invalid task ID provided' }
      });
    }

    if (!linkId || linkId === 'undefined' || !mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_LINK_ID', message: 'Invalid link ID provided' }
      });
    }

    const TaskLink = require('../models/TaskLink');
    
    const taskLink = await TaskLink.findOneAndDelete({
      _id: linkId,
      task_id: taskId,
      brand_id: brandId
    });

    if (!taskLink) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_LINK_NOT_FOUND', message: 'Task link not found' }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task link:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_LINK_DELETE_ERROR',
        message: 'Failed to delete task link',
        details: error.message
      }
    });
  }
};

const reorderTaskLinks = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;
    const { linkOrders } = req.body;

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRAND_ID', message: 'Invalid brand ID provided' }
      });
    }

    if (!taskId || taskId === 'undefined' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Invalid task ID provided' }
      });
    }

    if (!linkOrders || !Array.isArray(linkOrders)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'linkOrders array is required' }
      });
    }

    const TaskLink = require('../models/TaskLink');
    
    await TaskLink.reorderLinks(taskId, brandId, linkOrders);

    res.status(200).json({
      success: true,
      message: 'Task links reordered successfully'
    });

  } catch (error) {
    console.error('Error reordering task links:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_LINKS_REORDER_ERROR',
        message: 'Failed to reorder task links',
        details: error.message
      }
    });
  }
};

// ==================== TASK DEPENDENCIES BULK UPDATE ====================

const updateTaskDependencies = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;
    const { dependencies } = req.body;

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRAND_ID', message: 'Invalid brand ID provided' }
      });
    }

    if (!taskId || taskId === 'undefined' || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Invalid task ID provided' }
      });
    }

    if (!Array.isArray(dependencies)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dependencies must be an array' }
      });
    }

    // Verify task exists
    const task = await Task.findOne({ _id: taskId, brand_id: brandId });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
      });
    }

    // Validate all dependencies are valid ObjectIds
    const validDependencies = dependencies.filter(dep => 
      mongoose.Types.ObjectId.isValid(dep)
    );

    // Check for self-dependency
    const selfDependency = validDependencies.some(dep => 
      dep.toString() === taskId.toString()
    );
    
    if (selfDependency) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Task cannot depend on itself' }
      });
    }

    // Check for circular dependencies (basic check)
    for (const depId of validDependencies) {
      const depTask = await Task.findOne({ _id: depId, brand_id: brandId });
      if (depTask && depTask.dependencies.includes(taskId)) {
        return res.status(400).json({
          success: false,
          error: { code: 'CIRCULAR_DEPENDENCY', message: 'Circular dependency detected' }
        });
      }
    }

    // Update task dependencies
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { dependencies: validDependencies },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email')
     .populate('projectId', 'title')
     .populate('section_id', 'name')
     .populate('dependencies', 'id task status priority');

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: 'Task dependencies updated successfully'
    });

  } catch (error) {
    console.error('Error updating task dependencies:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_DEPENDENCIES_UPDATE_ERROR',
        message: 'Failed to update task dependencies',
        details: error.message
      }
    });
  }
};

module.exports = {
  getBrandTasks,
  getBrandTaskById,
  createBrandTask,
  updateBrandTask,
  deleteBrandTask,
  getBrandProjectTasks,
  assignTask,
  unassignTask,
  updateTaskStatus,
  updateTaskPriority,
  getTaskSections,
  createTaskSection,
  updateTaskSection,
  deleteTaskSection,
  getTaskDependencies,
  addTaskDependency,
  removeTaskDependency,
  getStatusWorkflow,
  updateStatusWorkflow,
  getPrioritySystem,
  updatePrioritySystem,
  getTaskAnalytics,
  getTaskAnalyticsById,
  searchTasks,
  filterTasks,
  // Task Links Management
  getTaskLinks,
  createTaskLink,
  updateTaskLink,
  deleteTaskLink,
  reorderTaskLinks,
  // Task Dependencies Bulk Update
  updateTaskDependencies
};
