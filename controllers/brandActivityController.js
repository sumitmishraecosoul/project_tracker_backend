const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Subtask = require('../models/Subtask');
const Comment = require('../models/Comment');

// Get all activities for a specific brand
const getBrandActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, type, priority, status, date_from, date_to } = req.query;

    // Build query with brand filter
    let query = { brand_id: brandId };

    // Apply additional filters
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }
    if (status) {
      query.status = status;
    }
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) {
        query.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        query.created_at.$lte = new Date(date_to);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get activities with pagination
    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .populate('recipients.user_id', 'name email')
      .populate('context.project_id', 'title')
      .populate('context.task_id', 'task')
      .populate('context.subtask_id', 'title')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNextPage: skip + activities.length < totalActivities,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Brand activities retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand activities:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_ACTIVITIES_FETCH_ERROR',
        message: 'Failed to fetch brand activities',
        details: error.message
      }
    });
  }
};

// Get activity details within a brand
const getBrandActivityById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId })
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .populate('recipients.user_id', 'name email')
      .populate('context.project_id', 'title')
      .populate('context.task_id', 'task')
      .populate('context.subtask_id', 'title');

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    // Check if user can view activity
    if (!activity.canUserView(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this activity'
        }
      });
    }

    // Increment view count
    activity.analytics.view_count += 1;
    await activity.save();

    res.json({
      success: true,
      data: activity,
      message: 'Brand activity details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand activity details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_ACTIVITY_FETCH_ERROR',
        message: 'Failed to fetch brand activity details',
        details: error.message
      }
    });
  }
};

// Get user activity feed
const getUserActivityFeed = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, types, priorities, tags, date_from, date_to } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      types: types ? types.split(',') : undefined,
      priorities: priorities ? priorities.split(',') : undefined,
      tags: tags ? tags.split(',') : undefined,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined
    };

    const activities = await Activity.getActivityFeed(brandId, req.user.id, options);

    res.json({
      success: true,
      data: activities,
      message: 'User activity feed retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user activity feed:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_ACTIVITY_FEED_FETCH_ERROR',
        message: 'Failed to fetch user activity feed',
        details: error.message
      }
    });
  }
};

// Get activities by entity
const getEntityActivities = async (req, res) => {
  try {
    const { brandId, entityType, entityId } = req.params;
    const { page = 1, limit = 20, type, priority } = req.query;

    // Validate entity type
    if (!['task', 'project', 'subtask', 'user', 'comment'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ENTITY_TYPE',
          message: 'Invalid entity type. Must be task, project, subtask, user, or comment'
        }
      });
    }

    // Check if entity exists
    let entity;
    switch (entityType) {
      case 'task':
        entity = await Task.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'project':
        entity = await Project.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'subtask':
        entity = await Subtask.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'user':
        entity = await User.findOne({ _id: entityId, brand_id: brandId });
        break;
      case 'comment':
        entity = await Comment.findOne({ _id: entityId, brand_id: brandId });
        break;
    }

    if (!entity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ENTITY_NOT_FOUND',
          message: 'Entity not found in this brand'
        }
      });
    }

    // Build query
    let query = {
      brand_id: brandId,
      'target.type': entityType,
      'target.id': entityId,
      status: 'active'
    };

    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .populate('recipients.user_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNextPage: skip + activities.length < totalActivities,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Entity activities retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching entity activities:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ENTITY_ACTIVITIES_FETCH_ERROR',
        message: 'Failed to fetch entity activities',
        details: error.message
      }
    });
  }
};

// Create activity within a brand
const createBrandActivity = async (req, res) => {
  try {
    const { brandId } = req.params;
    const {
      type,
      action,
      description,
      target,
      context,
      metadata,
      visibility,
      recipients,
      tags,
      priority
    } = req.body;

    // Validate required fields
    if (!type || !action || !description || !target) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Type, action, description, and target are required'
        }
      });
    }

    // Validate activity type
    const validTypes = [
      'task_created', 'task_updated', 'task_deleted', 'task_assigned', 'task_unassigned',
      'task_status_changed', 'task_priority_changed', 'task_completed', 'task_reopened',
      'project_created', 'project_updated', 'project_deleted', 'project_completed',
      'subtask_created', 'subtask_updated', 'subtask_deleted', 'subtask_completed',
      'comment_created', 'comment_updated', 'comment_deleted', 'comment_mentioned',
      'user_joined', 'user_left', 'user_invited', 'user_role_changed',
      'file_uploaded', 'file_deleted', 'file_shared',
      'meeting_scheduled', 'meeting_cancelled', 'meeting_completed',
      'deadline_approaching', 'deadline_passed', 'deadline_updated',
      'system_announcement', 'brand_updated', 'settings_changed'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid activity type'
        }
      });
    }

    // Create activity
    const activity = await Activity.createActivity({
      brand_id: brandId,
      type,
      action,
      description,
      actor: req.user.id,
      target,
      context,
      metadata,
      visibility: visibility || 'public',
      recipients: recipients || [{ user_id: req.user.id, role: 'actor' }],
      tags: tags || [],
      priority: priority || 'medium'
    });

    // Populate the created activity
    const populatedActivity = await Activity.findById(activity._id)
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .populate('recipients.user_id', 'name email');

    res.status(201).json({
      success: true,
      data: populatedActivity,
      message: 'Brand activity created successfully'
    });
  } catch (error) {
    console.error('Error creating brand activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_ACTIVITY_CREATE_ERROR',
        message: 'Failed to create brand activity',
        details: error.message
      }
    });
  }
};

// Update activity within a brand
const updateBrandActivity = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { action, description, metadata, visibility, tags, priority } = req.body;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    // Check if user can update activity (actor or admin/manager)
    if (activity.actor.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to update this activity'
        }
      });
    }

    // Update activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      {
        action: action || activity.action,
        description: description || activity.description,
        metadata: metadata || activity.metadata,
        visibility: visibility || activity.visibility,
        tags: tags || activity.tags,
        priority: priority || activity.priority
      },
      { new: true, runValidators: true }
    ).populate('actor', 'name email avatar')
     .populate('target.id', 'name title task')
     .populate('recipients.user_id', 'name email');

    res.json({
      success: true,
      data: updatedActivity,
      message: 'Brand activity updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_ACTIVITY_UPDATE_ERROR',
        message: 'Failed to update brand activity',
        details: error.message
      }
    });
  }
};

// Delete activity within a brand
const deleteBrandActivity = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    // Check if user can delete activity (actor or admin)
    if (activity.actor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'You do not have permission to delete this activity'
        }
      });
    }

    // Soft delete activity
    activity.status = 'deleted';
    await activity.save();

    res.json({
      success: true,
      message: 'Brand activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_ACTIVITY_DELETE_ERROR',
        message: 'Failed to delete brand activity',
        details: error.message
      }
    });
  }
};

// Add activity recipient
const addActivityRecipient = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { user_id, role } = req.body;

    if (!user_id || !role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'user_id and role are required'
        }
      });
    }

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    // Check if user exists in brand
    const user = await User.findOne({ _id: user_id, brand_id: brandId });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in this brand'
        }
      });
    }

    const result = await activity.addRecipient(user_id, role);

    if (!result) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RECIPIENT_EXISTS',
          message: 'User is already a recipient of this activity'
        }
      });
    }

    res.json({
      success: true,
      data: activity,
      message: 'Activity recipient added successfully'
    });
  } catch (error) {
    console.error('Error adding activity recipient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_RECIPIENT_ADD_ERROR',
        message: 'Failed to add activity recipient',
        details: error.message
      }
    });
  }
};

// Remove activity recipient
const removeActivityRecipient = async (req, res) => {
  try {
    const { brandId, id, userId } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    await activity.removeRecipient(userId);

    res.json({
      success: true,
      data: activity,
      message: 'Activity recipient removed successfully'
    });
  } catch (error) {
    console.error('Error removing activity recipient:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_RECIPIENT_REMOVE_ERROR',
        message: 'Failed to remove activity recipient',
        details: error.message
      }
    });
  }
};

// Mark activity as read
const markActivityAsRead = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    const result = await activity.markAsRead(req.user.id);

    if (!result) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You are not a recipient of this activity'
        }
      });
    }

    res.json({
      success: true,
      data: activity,
      message: 'Activity marked as read successfully'
    });
  } catch (error) {
    console.error('Error marking activity as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_READ_ERROR',
        message: 'Failed to mark activity as read',
        details: error.message
      }
    });
  }
};

// Mark activity as notified
const markActivityAsNotified = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    const result = await activity.markAsNotified(req.user.id);

    if (!result) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You are not a recipient of this activity'
        }
      });
    }

    res.json({
      success: true,
      data: activity,
      message: 'Activity marked as notified successfully'
    });
  } catch (error) {
    console.error('Error marking activity as notified:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_NOTIFIED_ERROR',
        message: 'Failed to mark activity as notified',
        details: error.message
      }
    });
  }
};

// Archive activity
const archiveActivity = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    activity.status = 'archived';
    await activity.save();

    res.json({
      success: true,
      data: activity,
      message: 'Activity archived successfully'
    });
  } catch (error) {
    console.error('Error archiving activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ARCHIVE_ERROR',
        message: 'Failed to archive activity',
        details: error.message
      }
    });
  }
};

// Search activities
const searchActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, page = 1, limit = 20, type, priority } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required'
        }
      });
    }

    let query = {
      brand_id: brandId,
      $or: [
        { action: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ],
      status: 'active'
    };

    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .populate('recipients.user_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNextPage: skip + activities.length < totalActivities,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Activity search completed successfully'
    });
  } catch (error) {
    console.error('Error searching activities:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_SEARCH_ERROR',
        message: 'Failed to search activities',
        details: error.message
      }
    });
  }
};

// Filter activities
const filterActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type, priority, status, date_from, date_to, page = 1, limit = 20 } = req.query;

    let query = { brand_id: brandId };

    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }
    if (status) {
      query.status = status;
    }
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) {
        query.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        query.created_at.$lte = new Date(date_to);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .populate('recipients.user_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNextPage: skip + activities.length < totalActivities,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Activity filtering completed successfully'
    });
  } catch (error) {
    console.error('Error filtering activities:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_FILTER_ERROR',
        message: 'Failed to filter activities',
        details: error.message
      }
    });
  }
};

// Get activity analytics
const getActivityAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type, date_from, date_to } = req.query;

    const options = {
      type: type,
      date_from: date_from ? new Date(date_from) : undefined,
      date_to: date_to ? new Date(date_to) : undefined
    };

    const analytics = await Activity.getActivityAnalytics(brandId, options);

    res.json({
      success: true,
      data: analytics,
      message: 'Activity analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching activity analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch activity analytics',
        details: error.message
      }
    });
  }
};

// Get activity analytics by ID
const getActivityAnalyticsById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    const summary = activity.getSummary();

    res.json({
      success: true,
      data: {
        activity_id: activity._id,
        summary,
        analytics: activity.analytics
      },
      message: 'Activity analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching activity analytics by ID:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch activity analytics',
        details: error.message
      }
    });
  }
};

// Export activities
const exportActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type, format = 'json', date_from, date_to } = req.query;

    let query = { brand_id: brandId };

    if (type) {
      query.type = type;
    }
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) {
        query.created_at.$gte = new Date(date_from);
      }
      if (date_to) {
        query.created_at.$lte = new Date(date_to);
      }
    }

    const activities = await Activity.find(query)
      .populate('actor', 'name email')
      .populate('target.id', 'name title task')
      .sort({ created_at: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        action: activity.action,
        description: activity.description,
        actor: activity.actor.name,
        target_type: activity.target.type,
        target_name: activity.target.name,
        created_at: activity.created_at,
        priority: activity.priority,
        status: activity.status
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      res.json({
        success: true,
        data: csvData,
        message: 'Activities exported successfully'
      });
    } else {
      res.json({
        success: true,
        data: activities,
        message: 'Activities exported successfully'
      });
    }
  } catch (error) {
    console.error('Error exporting activities:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_EXPORT_ERROR',
        message: 'Failed to export activities',
        details: error.message
      }
    });
  }
};

// Get activity notifications
const getActivityNotifications = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, unread_only = false } = req.query;

    let query = {
      brand_id: brandId,
      'recipients.user_id': req.user.id,
      status: 'active'
    };

    if (unread_only === 'true') {
      query['recipients.read_at'] = { $exists: false };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar')
      .populate('target.id', 'name title task')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalActivities = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalActivities / parseInt(limit)),
          totalActivities,
          hasNextPage: skip + activities.length < totalActivities,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Activity notifications retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching activity notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_NOTIFICATIONS_FETCH_ERROR',
        message: 'Failed to fetch activity notifications',
        details: error.message
      }
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    const result = await activity.markAsRead(req.user.id);

    if (!result) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You are not a recipient of this activity'
        }
      });
    }

    res.json({
      success: true,
      data: activity,
      message: 'Notification marked as read successfully'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTIFICATION_READ_ERROR',
        message: 'Failed to mark notification as read',
        details: error.message
      }
    });
  }
};

// Mark notification as unread
const markNotificationAsUnread = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({ _id: id, brand_id: brandId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVITY_NOT_FOUND',
          message: 'Activity not found in this brand'
        }
      });
    }

    const recipient = activity.recipients.find(r => r.user_id.toString() === req.user.id.toString());
    if (!recipient) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You are not a recipient of this activity'
        }
      });
    }

    recipient.read_at = undefined;
    await activity.save();

    res.json({
      success: true,
      data: activity,
      message: 'Notification marked as unread successfully'
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTIFICATION_UNREAD_ERROR',
        message: 'Failed to mark notification as unread',
        details: error.message
      }
    });
  }
};

// Get activity preferences
const getActivityPreferences = async (req, res) => {
  try {
    const { brandId } = req.params;

    // This would typically come from user preferences
    const preferences = {
      email_notifications: true,
      in_app_notifications: true,
      activity_types: ['task_created', 'task_updated', 'comment_created'],
      notification_frequency: 'immediate',
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    res.json({
      success: true,
      data: preferences,
      message: 'Activity preferences retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching activity preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_PREFERENCES_FETCH_ERROR',
        message: 'Failed to fetch activity preferences',
        details: error.message
      }
    });
  }
};

// Update activity preferences
const updateActivityPreferences = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { email_notifications, in_app_notifications, activity_types, notification_frequency, quiet_hours } = req.body;

    // This would typically update user preferences in database
    const preferences = {
      email_notifications: email_notifications !== undefined ? email_notifications : true,
      in_app_notifications: in_app_notifications !== undefined ? in_app_notifications : true,
      activity_types: activity_types || ['task_created', 'task_updated', 'comment_created'],
      notification_frequency: notification_frequency || 'immediate',
      quiet_hours: quiet_hours || {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    res.json({
      success: true,
      data: preferences,
      message: 'Activity preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating activity preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_PREFERENCES_UPDATE_ERROR',
        message: 'Failed to update activity preferences',
        details: error.message
      }
    });
  }
};

module.exports = {
  getBrandActivities,
  getBrandActivityById,
  getUserActivityFeed,
  getEntityActivities,
  createBrandActivity,
  updateBrandActivity,
  deleteBrandActivity,
  addActivityRecipient,
  removeActivityRecipient,
  markActivityAsRead,
  markActivityAsNotified,
  archiveActivity,
  searchActivities,
  filterActivities,
  getActivityAnalytics,
  getActivityAnalyticsById,
  exportActivities,
  getActivityNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  getActivityPreferences,
  updateActivityPreferences
};
