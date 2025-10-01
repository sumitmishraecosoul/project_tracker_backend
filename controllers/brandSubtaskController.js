const mongoose = require('mongoose');
const Subtask = require('../models/Subtask');
const SubtaskTemplate = require('../models/SubtaskTemplate');
const Task = require('../models/Task');
const User = require('../models/User');

// Get all subtasks for a specific brand
const getBrandSubtasks = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 10, status, priority, assignedTo, taskId, search } = req.query;

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
    if (taskId) {
      query.task_id = taskId;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get subtasks with pagination
    const subtasks = await Subtask.find(query)
      .populate({
        path: 'assignedTo',
        select: 'name email avatar',
        model: 'User'
      })
      .populate({
        path: 'reporter',
        select: 'name email avatar',
        model: 'User'
      })
      .populate({
        path: 'task_id',
        select: 'id task title',
        model: 'Task'
      })
      .populate({
        path: 'createdBy',
        select: 'name email avatar',
        model: 'User'
      })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalSubtasks = await Subtask.countDocuments(query);

    res.json({
      success: true,
      data: {
        subtasks: subtasks.map(subtask => ({
          _id: subtask._id,
          id: subtask.id,
          title: subtask.title,
          description: subtask.description,
          status: subtask.status,
          priority: subtask.priority,
          assignedTo: subtask.assignedTo ? {
            _id: subtask.assignedTo._id,
            name: subtask.assignedTo.name,
            email: subtask.assignedTo.email,
            avatar: subtask.assignedTo.avatar || null
          } : null,
          reporter: subtask.reporter ? {
            _id: subtask.reporter._id,
            name: subtask.reporter.name,
            email: subtask.reporter.email,
            avatar: subtask.reporter.avatar || null
          } : null,
          task: subtask.task_id ? {
            _id: subtask.task_id._id,
            id: subtask.task_id.id,
            title: subtask.task_id.task || subtask.task_id.title
          } : null,
          createdBy: subtask.createdBy ? {
            _id: subtask.createdBy._id,
            name: subtask.createdBy.name,
            email: subtask.createdBy.email,
            avatar: subtask.createdBy.avatar || null
          } : null,
          startDate: subtask.startDate,
          dueDate: subtask.dueDate,
          estimatedHours: subtask.estimatedHours,
          actualHours: subtask.actualHours,
          order: subtask.order,
          is_completed: subtask.is_completed,
          brand_id: subtask.brand_id,
          created_at: subtask.created_at,
          updated_at: subtask.updated_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubtasks / parseInt(limit)),
          totalSubtasks,
          hasNextPage: skip + subtasks.length < totalSubtasks,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Brand subtasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand subtasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SUBTASKS_FETCH_ERROR',
        message: 'Failed to fetch brand subtasks',
        details: error.message
      }
    });
  }
};

// Get subtask details within a brand
const getBrandSubtaskById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOne({ _id: id, brand_id: brandId })
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('task_id', 'id task')
      .populate('createdBy', 'name email')
      .populate('parentSubtask', 'id title')
      .populate('template_id', 'name');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    // Get child subtasks
    const childSubtasks = await Subtask.find({ 
      parentSubtask: id, 
      brand_id: brandId 
    }).populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: {
        subtask,
        childSubtasks
      },
      message: 'Brand subtask details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand subtask details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SUBTASK_FETCH_ERROR',
        message: 'Failed to fetch brand subtask details',
        details: error.message
      }
    });
  }
};

// Create subtask within a brand
const createBrandSubtask = async (req, res) => {
  try {
    const { brandId } = req.params;
    const subtaskData = {
      ...req.body,
      brand_id: brandId,
      createdBy: req.user.id,
      reporter: req.user.id
    };

    // Validate required fields
    if (!subtaskData.title || !subtaskData.task_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and task_id are required'
        }
      });
    }

    // Validate assignedTo is a valid ObjectId if provided
    if (subtaskData.assignedTo && !mongoose.Types.ObjectId.isValid(subtaskData.assignedTo)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid assignedTo user ID. Please provide a valid user ID, not a username.'
        }
      });
    }

    // Create subtask
    const subtask = await Subtask.create(subtaskData);

    // Populate the created subtask
    const populatedSubtask = await Subtask.findById(subtask._id)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('task_id', 'id task')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedSubtask,
      message: 'Brand subtask created successfully'
    });
  } catch (error) {
    console.error('Error creating brand subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SUBTASK_CREATE_ERROR',
        message: 'Failed to create brand subtask',
        details: error.message
      }
    });
  }
};

// Update subtask within a brand
const updateBrandSubtask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOne({ _id: id, brand_id: brandId });

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    // Update subtask
    const updatedSubtask = await Subtask.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email')
     .populate('task_id', 'id task')
     .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: updatedSubtask,
      message: 'Brand subtask updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SUBTASK_UPDATE_ERROR',
        message: 'Failed to update brand subtask',
        details: error.message
      }
    });
  }
};

// Delete subtask within a brand
const deleteBrandSubtask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOne({ _id: id, brand_id: brandId });

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    // Delete child subtasks
    await Subtask.deleteMany({ parentSubtask: id, brand_id: brandId });

    // Delete subtask
    await Subtask.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Brand subtask deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SUBTASK_DELETE_ERROR',
        message: 'Failed to delete brand subtask',
        details: error.message
      }
    });
  }
};

// Get subtasks for a specific task within a brand
const getBrandTaskSubtasks = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;
    const { status, priority, assignedTo } = req.query;

    let query = { task_id: taskId, brand_id: brandId };

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

    const subtasks = await Subtask.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: subtasks,
      message: 'Brand task subtasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand task subtasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_TASK_SUBTASKS_FETCH_ERROR',
        message: 'Failed to fetch brand task subtasks',
        details: error.message
      }
    });
  }
};

// Assign subtask to user
const assignSubtask = async (req, res) => {
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

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_ASSIGN_ERROR',
        message: 'Failed to assign subtask',
        details: error.message
      }
    });
  }
};

// Unassign subtask from user
const unassignSubtask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { assignedTo: null },
      { new: true, runValidators: true }
    );

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask unassigned successfully'
    });
  } catch (error) {
    console.error('Error unassigning subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_UNASSIGN_ERROR',
        message: 'Failed to unassign subtask',
        details: error.message
      }
    });
  }
};

// Update subtask status
const updateSubtaskStatus = async (req, res) => {
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

    const validStatuses = ['To Do', 'In Progress', 'Completed', 'Blocked', 'On Hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        }
      });
    }

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { status },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask status updated successfully'
    });
  } catch (error) {
    console.error('Error updating subtask status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_STATUS_UPDATE_ERROR',
        message: 'Failed to update subtask status',
        details: error.message
      }
    });
  }
};

// Update subtask priority
const updateSubtaskPriority = async (req, res) => {
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

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { priority },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask priority updated successfully'
    });
  } catch (error) {
    console.error('Error updating subtask priority:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_PRIORITY_UPDATE_ERROR',
        message: 'Failed to update subtask priority',
        details: error.message
      }
    });
  }
};

// Reorder subtasks
const reorderSubtasks = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { order } = req.body;

    if (order === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Order is required'
        }
      });
    }

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { order },
      { new: true, runValidators: true }
    );

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering subtasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_REORDER_ERROR',
        message: 'Failed to reorder subtasks',
        details: error.message
      }
    });
  }
};

// Reorder task subtasks
const reorderTaskSubtasks = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;
    const { subtaskOrders } = req.body;

    if (!subtaskOrders || !Array.isArray(subtaskOrders)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'subtaskOrders array is required'
        }
      });
    }

    // Update all subtasks with new orders
    const updatePromises = subtaskOrders.map(({ subtaskId, order }) => 
      Subtask.findOneAndUpdate(
        { _id: subtaskId, task_id: taskId, brand_id: brandId },
        { order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Task subtasks reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering task subtasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SUBTASKS_REORDER_ERROR',
        message: 'Failed to reorder task subtasks',
        details: error.message
      }
    });
  }
};

// Complete subtask
const completeSubtask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { 
        status: 'Completed',
        is_completed: true,
        completedAt: new Date(),
        completedBy: req.user.id
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask completed successfully'
    });
  } catch (error) {
    console.error('Error completing subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_COMPLETE_ERROR',
        message: 'Failed to complete subtask',
        details: error.message
      }
    });
  }
};

// Uncomplete subtask
const uncompleteSubtask = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { 
        status: 'To Do',
        is_completed: false,
        completedAt: undefined,
        completedBy: undefined
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('reporter', 'name email');

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: subtask,
      message: 'Subtask uncompleted successfully'
    });
  } catch (error) {
    console.error('Error uncompleting subtask:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_UNCOMPLETE_ERROR',
        message: 'Failed to uncomplete subtask',
        details: error.message
      }
    });
  }
};

// Subtask templates management
const getSubtaskTemplates = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { category, is_public, page = 1, limit = 10 } = req.query;

    let query = { brand_id: brandId, is_active: true };

    if (category) {
      query.category = category;
    }
    if (is_public !== undefined) {
      query.is_public = is_public === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const templates = await SubtaskTemplate.find(query)
      .populate('created_by', 'name email')
      .sort({ usage_count: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTemplates = await SubtaskTemplate.countDocuments(query);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTemplates / parseInt(limit)),
          totalTemplates,
          hasNextPage: skip + templates.length < totalTemplates,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Subtask templates retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subtask templates:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_TEMPLATES_FETCH_ERROR',
        message: 'Failed to fetch subtask templates',
        details: error.message
      }
    });
  }
};

const getSubtaskTemplateById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const template = await SubtaskTemplate.findOne({ _id: id, brand_id: brandId })
      .populate('created_by', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: template,
      message: 'Subtask template details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subtask template details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_TEMPLATE_FETCH_ERROR',
        message: 'Failed to fetch subtask template details',
        details: error.message
      }
    });
  }
};

const createSubtaskTemplate = async (req, res) => {
  try {
    const { brandId } = req.params;
    const templateData = {
      ...req.body,
      brand_id: brandId,
      created_by: req.user.id
    };

    if (!templateData.name || !templateData.subtasks || templateData.subtasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and subtasks are required'
        }
      });
    }

    const template = await SubtaskTemplate.create(templateData);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Subtask template created successfully'
    });
  } catch (error) {
    console.error('Error creating subtask template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_TEMPLATE_CREATE_ERROR',
        message: 'Failed to create subtask template',
        details: error.message
      }
    });
  }
};

const updateSubtaskTemplate = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const template = await SubtaskTemplate.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      req.body,
      { new: true, runValidators: true }
    ).populate('created_by', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: template,
      message: 'Subtask template updated successfully'
    });
  } catch (error) {
    console.error('Error updating subtask template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_TEMPLATE_UPDATE_ERROR',
        message: 'Failed to update subtask template',
        details: error.message
      }
    });
  }
};

const deleteSubtaskTemplate = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const template = await SubtaskTemplate.findOneAndDelete({
      _id: id,
      brand_id: brandId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      message: 'Subtask template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subtask template:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_TEMPLATE_DELETE_ERROR',
        message: 'Failed to delete subtask template',
        details: error.message
      }
    });
  }
};

// Apply template to task
const applyTemplateToTask = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;
    const { templateId, assignedTo } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'templateId is required'
        }
      });
    }

    const template = await SubtaskTemplate.findOne({ _id: templateId, brand_id: brandId });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'Template not found in this brand'
        }
      });
    }

    // Create subtasks from template
    const subtasks = template.subtasks.map((subtask, index) => ({
      brand_id: brandId,
      task_id: taskId,
      title: subtask.title,
      description: subtask.description,
      priority: subtask.priority,
      estimatedHours: subtask.estimatedHours,
      order: index + 1,
      assignedTo: assignedTo || null,
      reporter: req.user.id,
      createdBy: req.user.id,
      template_id: templateId,
      labels: subtask.labels || []
    }));

    const createdSubtasks = await Subtask.insertMany(subtasks);

    // Update template usage
    await template.incrementUsage();

    res.status(201).json({
      success: true,
      data: createdSubtasks,
      message: 'Template applied to task successfully'
    });
  } catch (error) {
    console.error('Error applying template to task:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATE_APPLY_ERROR',
        message: 'Failed to apply template to task',
        details: error.message
      }
    });
  }
};

// Subtask analytics
const getSubtaskAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Get subtask statistics by status
    const statusStats = await Subtask.aggregate([
      { $match: { brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get subtask statistics by priority
    const priorityStats = await Subtask.aggregate([
      { $match: { brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get subtask statistics by assignee
    const assigneeStats = await Subtask.aggregate([
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
      message: 'Subtask analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subtask analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch subtask analytics',
        details: error.message
      }
    });
  }
};

const getSubtaskAnalyticsById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const subtask = await Subtask.findOne({ _id: id, brand_id: brandId });

    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBTASK_NOT_FOUND',
          message: 'Subtask not found in this brand'
        }
      });
    }

    // Get child subtasks
    const childSubtasks = await Subtask.find({ 
      parentSubtask: id, 
      brand_id: brandId 
    });

    res.json({
      success: true,
      data: {
        subtask,
        childSubtasks,
        statistics: subtask.getTimeTracking()
      },
      message: 'Subtask analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching subtask analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch subtask analytics',
        details: error.message
      }
    });
  }
};

const getTaskSubtaskAnalytics = async (req, res) => {
  try {
    const { brandId, taskId } = req.params;

    const stats = await Subtask.getSubtaskStats(taskId, brandId);

    res.json({
      success: true,
      data: stats,
      message: 'Task subtask analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching task subtask analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASK_SUBTASK_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch task subtask analytics',
        details: error.message
      }
    });
  }
};

// Subtask search and filtering
const searchSubtasks = async (req, res) => {
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
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subtasks = await Subtask.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('task_id', 'id task')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSubtasks = await Subtask.countDocuments(query);

    res.json({
      success: true,
      data: {
        subtasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubtasks / parseInt(limit)),
          totalSubtasks,
          hasNextPage: skip + subtasks.length < totalSubtasks,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Subtask search completed successfully'
    });
  } catch (error) {
    console.error('Error searching subtasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_SEARCH_ERROR',
        message: 'Failed to search subtasks',
        details: error.message
      }
    });
  }
};

const filterSubtasks = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { status, priority, assignedTo, taskId, page = 1, limit = 10 } = req.query;

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
    if (taskId) {
      query.task_id = taskId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subtasks = await Subtask.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('task_id', 'id task')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSubtasks = await Subtask.countDocuments(query);

    res.json({
      success: true,
      data: {
        subtasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubtasks / parseInt(limit)),
          totalSubtasks,
          hasNextPage: skip + subtasks.length < totalSubtasks,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Subtask filtering completed successfully'
    });
  } catch (error) {
    console.error('Error filtering subtasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBTASK_FILTER_ERROR',
        message: 'Failed to filter subtasks',
        details: error.message
      }
    });
  }
};

module.exports = {
  getBrandSubtasks,
  getBrandSubtaskById,
  createBrandSubtask,
  updateBrandSubtask,
  deleteBrandSubtask,
  getBrandTaskSubtasks,
  assignSubtask,
  unassignSubtask,
  updateSubtaskStatus,
  updateSubtaskPriority,
  reorderSubtasks,
  reorderTaskSubtasks,
  completeSubtask,
  uncompleteSubtask,
  getSubtaskTemplates,
  getSubtaskTemplateById,
  createSubtaskTemplate,
  updateSubtaskTemplate,
  deleteSubtaskTemplate,
  applyTemplateToTask,
  getSubtaskAnalytics,
  getSubtaskAnalyticsById,
  getTaskSubtaskAnalytics,
  searchSubtasks,
  filterSubtasks
};
