const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all activities for a brand
const getBrandActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, type, priority, visibility, status = 'active' } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId),
      status: status
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (visibility) query.visibility = visibility;

    const activities = await Activity.find(query)
      .populate('created_by', 'name email avatar')
      .populate('recipients.user', 'name email avatar')
      .populate('mentions.user', 'name email avatar')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching brand activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brand activities',
      error: error.message
    });
  }
};

// Get activity details
const getBrandActivityById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    })
      .populate('created_by', 'name email avatar')
      .populate('recipients.user', 'name email avatar')
      .populate('mentions.user', 'name email avatar')
      .populate('reactions.user', 'name email avatar');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity details',
      error: error.message
    });
  }
};

// Get user activity feed
const getUserActivityFeed = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, type, priority, visibility } = req.query;
    const userId = req.user.id;

    const activities = await Activity.getUserActivityFeed(
      new mongoose.Types.ObjectId(userId),
      new mongoose.Types.ObjectId(brandId),
      { type, priority, visibility, limit: limit * 1, skip: (page - 1) * limit }
    );

    const total = await Activity.countDocuments({
      brand_id: new mongoose.Types.ObjectId(brandId),
      $or: [
        { created_by: new mongoose.Types.ObjectId(userId) },
        { 'recipients.user': new mongoose.Types.ObjectId(userId) }
      ],
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user activity feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user activity feed',
      error: error.message
    });
  }
};

// Get activities for a specific entity
const getEntityActivities = async (req, res) => {
  try {
    const { brandId, entityType, entityId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const activities = await Activity.getEntityActivities(
      entityType,
      new mongoose.Types.ObjectId(entityId),
      new mongoose.Types.ObjectId(brandId),
      { type, limit: limit * 1, skip: (page - 1) * limit }
    );

    const total = await Activity.countDocuments({
      'metadata.entity_type': entityType,
      'metadata.entity_id': new mongoose.Types.ObjectId(entityId),
      brand_id: new mongoose.Types.ObjectId(brandId),
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching entity activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entity activities',
      error: error.message
    });
  }
};

// Create activity
const createBrandActivity = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { 
      type, 
      title, 
      description, 
      metadata, 
      recipients = [], 
      priority = 'medium', 
      visibility = 'public',
      tags = [],
      mentions = [],
      attachments = []
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and description are required'
      });
    }

    // Create activity
    const activity = new Activity({
      brand_id: new mongoose.Types.ObjectId(brandId),
      created_by: new mongoose.Types.ObjectId(userId),
      type,
      title: title.trim(),
      description: description.trim(),
      metadata: {
        entity_type: metadata.entity_type || 'system',
        entity_id: metadata.entity_id ? new mongoose.Types.ObjectId(metadata.entity_id) : new mongoose.Types.ObjectId(),
        entity_title: metadata.entity_title || title,
        entity_url: metadata.entity_url,
        old_values: metadata.old_values,
        new_values: metadata.new_values,
        additional_data: metadata.additional_data
      },
      recipients: recipients.map(recipient => ({
        user: new mongoose.Types.ObjectId(recipient.user),
        role: recipient.role || 'secondary',
        notification_sent: false,
        read: false,
        notified: false
      })),
      priority,
      visibility,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      mentions: mentions.map(mention => ({
        user: new mongoose.Types.ObjectId(mention),
        mentioned_at: new Date(),
        notified: false
      })),
      attachments: attachments,
      system_metadata: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        device_type: req.get('X-Device-Type') || 'unknown',
        browser: req.get('X-Browser') || 'unknown',
        source: req.get('X-Source') || 'api'
      }
    });

    await activity.save();

    // Populate the activity
    await activity.populate('created_by', 'name email avatar');
    await activity.populate('recipients.user', 'name email avatar');
    await activity.populate('mentions.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating activity',
      error: error.message
    });
  }
};

// Update activity
const updateBrandActivity = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { title, description, priority, visibility, tags } = req.body;
    const userId = req.user.id;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user can update this activity
    if (activity.created_by.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this activity'
      });
    }

    // Update activity
    if (title) activity.title = title.trim();
    if (description) activity.description = description.trim();
    if (priority) activity.priority = priority;
    if (visibility) activity.visibility = visibility;
    if (tags) activity.tags = tags.map(tag => tag.toLowerCase().trim());

    await activity.save();

    // Populate the activity
    await activity.populate('created_by', 'name email avatar');
    await activity.populate('recipients.user', 'name email avatar');
    await activity.populate('mentions.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating activity',
      error: error.message
    });
  }
};

// Delete activity
const deleteBrandActivity = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user can delete this activity
    if (activity.created_by.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this activity'
      });
    }

    // Soft delete
    activity.status = 'deleted';
    await activity.save();

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting activity',
      error: error.message
    });
  }
};

// Add recipient to activity
const addActivityRecipient = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { userId, role = 'secondary' } = req.body;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Add recipient
    await activity.addRecipient(userId, role);
    await activity.populate('recipients.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Recipient added successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error adding recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding recipient',
      error: error.message
    });
  }
};

// Remove recipient from activity
const removeActivityRecipient = async (req, res) => {
  try {
    const { brandId, id, userId } = req.params;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Remove recipient
    await activity.removeRecipient(userId);
    await activity.populate('recipients.user', 'name email avatar');

    res.json({
      success: true,
      message: 'Recipient removed successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error removing recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing recipient',
      error: error.message
    });
  }
};

// Mark activity as read
const markActivityAsRead = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Mark as read
    await activity.markAsRead(userId);

    res.json({
      success: true,
      message: 'Activity marked as read',
      data: activity
    });
  } catch (error) {
    console.error('Error marking activity as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking activity as read',
      error: error.message
    });
  }
};

// Mark activity as notified
const markActivityAsNotified = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Mark as notified
    await activity.markAsNotified(userId);

    res.json({
      success: true,
      message: 'Activity marked as notified',
      data: activity
    });
  } catch (error) {
    console.error('Error marking activity as notified:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking activity as notified',
      error: error.message
    });
  }
};

// Archive activity
const archiveActivity = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Archive activity
    await activity.archiveActivity();

    res.json({
      success: true,
      message: 'Activity archived successfully',
      data: activity
    });
  } catch (error) {
    console.error('Error archiving activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving activity',
      error: error.message
    });
  }
};

// Search activities
const searchActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const activities = await Activity.searchActivities(
      new mongoose.Types.ObjectId(brandId),
      q,
      { limit: limit * 1, skip: (page - 1) * limit }
    );

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(activities.length / limit),
          total: activities.length
        }
      }
    });
  } catch (error) {
    console.error('Error searching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching activities',
      error: error.message
    });
  }
};

// Filter activities
const filterActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { 
      type, 
      priority, 
      visibility, 
      status, 
      created_by, 
      date_from, 
      date_to, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId)
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (visibility) query.visibility = visibility;
    if (status) query.status = status;
    if (created_by) query.created_by = new mongoose.Types.ObjectId(created_by);

    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) query.created_at.$gte = new Date(date_from);
      if (date_to) query.created_at.$lte = new Date(date_to);
    }

    const activities = await Activity.find(query)
      .populate('created_by', 'name email avatar')
      .populate('recipients.user', 'name email avatar')
      .populate('mentions.user', 'name email avatar')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error filtering activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering activities',
      error: error.message
    });
  }
};

// Get activity analytics
const getActivityAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type, date_from, date_to } = req.query;

    const analytics = await Activity.getActivityAnalytics(
      new mongoose.Types.ObjectId(brandId),
      { type, date_from, date_to }
    );

    res.json({
      success: true,
      data: analytics[0] || {
        total_activities: 0,
        total_reactions: 0,
        total_mentions: 0,
        total_recipients: 0,
        avg_reactions_per_activity: 0,
        avg_mentions_per_activity: 0,
        activities_by_type: []
      }
    });
  } catch (error) {
    console.error('Error fetching activity analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity analytics',
      error: error.message
    });
  }
};

// Get activity analytics by ID
const getActivityAnalyticsById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const analytics = {
      view_count: activity.analytics.view_count,
      interaction_count: activity.analytics.interaction_count,
      share_count: activity.analytics.share_count,
      engagement_score: activity.analytics.engagement_score,
      reactions: activity.reactions,
      mentions: activity.mentions,
      recipients: activity.recipients,
      attachments: activity.attachments
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching activity analytics by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity analytics by ID',
      error: error.message
    });
  }
};

// Export activities
const exportActivities = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type, date_from, date_to, format = 'json' } = req.query;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId),
      status: 'active'
    };

    if (type) query.type = type;

    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) query.created_at.$gte = new Date(date_from);
      if (date_to) query.created_at.$lte = new Date(date_to);
    }

    const activities = await Activity.find(query)
      .populate('created_by', 'name email')
      .populate('recipients.user', 'name email')
      .populate('mentions.user', 'name email')
      .sort({ created_at: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        created_by: activity.created_by.name,
        priority: activity.priority,
        visibility: activity.visibility,
        created_at: activity.created_at,
        reactions: activity.reactions.length,
        mentions: activity.mentions.length,
        recipients: activity.recipients.length
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activities.csv');
      res.json({
        success: true,
        data: csvData
      });
    } else {
      res.json({
        success: true,
        data: activities
      });
    }
  } catch (error) {
    console.error('Error exporting activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting activities',
      error: error.message
    });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 20, read, notified } = req.query;
    const userId = req.user.id;

    const query = {
      brand_id: new mongoose.Types.ObjectId(brandId),
      'recipients.user': new mongoose.Types.ObjectId(userId),
      status: 'active'
    };

    if (read !== undefined) {
      query['recipients.read'] = read === 'true';
    }

    if (notified !== undefined) {
      query['recipients.notified'] = notified === 'true';
    }

    const activities = await Activity.find(query)
      .populate('created_by', 'name email avatar')
      .populate('recipients.user', 'name email avatar')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId),
      'recipients.user': new mongoose.Types.ObjectId(userId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Mark as read
    await activity.markAsRead(userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: activity
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// Mark notification as unread
const markNotificationAsUnread = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findOne({
      _id: id,
      brand_id: new mongoose.Types.ObjectId(brandId),
      'recipients.user': new mongoose.Types.ObjectId(userId)
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Mark as unread
    const recipient = activity.recipients.find(r => r.user.toString() === userId.toString());
    if (recipient) {
      recipient.read = false;
      recipient.read_at = null;
    }
    await activity.save();

    res.json({
      success: true,
      message: 'Notification marked as unread',
      data: activity
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as unread',
      error: error.message
    });
  }
};

// Get activity preferences
const getActivityPreferences = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    // Get user preferences (this would typically be stored in user profile or separate preferences model)
    const user = await User.findById(userId);
    
    const preferences = {
      email_notifications: user.email_notifications || true,
      push_notifications: user.push_notifications || true,
      activity_types: user.activity_types || ['task_created', 'task_updated', 'comment_added'],
      notification_frequency: user.notification_frequency || 'immediate',
      quiet_hours: user.quiet_hours || { start: '22:00', end: '08:00' }
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching activity preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity preferences',
      error: error.message
    });
  }
};

// Update activity preferences
const updateActivityPreferences = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { 
      email_notifications, 
      push_notifications, 
      activity_types, 
      notification_frequency, 
      quiet_hours 
    } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (email_notifications !== undefined) user.email_notifications = email_notifications;
    if (push_notifications !== undefined) user.push_notifications = push_notifications;
    if (activity_types) user.activity_types = activity_types;
    if (notification_frequency) user.notification_frequency = notification_frequency;
    if (quiet_hours) user.quiet_hours = quiet_hours;

    await user.save();

    res.json({
      success: true,
      message: 'Activity preferences updated successfully',
      data: {
        email_notifications: user.email_notifications,
        push_notifications: user.push_notifications,
        activity_types: user.activity_types,
        notification_frequency: user.notification_frequency,
        quiet_hours: user.quiet_hours
      }
    });
  } catch (error) {
    console.error('Error updating activity preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating activity preferences',
      error: error.message
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
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  getActivityPreferences,
  updateActivityPreferences
};