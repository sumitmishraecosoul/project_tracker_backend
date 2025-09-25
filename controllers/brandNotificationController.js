const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

// Helper to validate entity existence
const validateEntity = async (brandId, entityType, entityId) => {
  let EntityModel;
  switch (entityType) {
    case 'tasks': EntityModel = Task; break;
    case 'projects': EntityModel = Project; break;
    case 'comments': EntityModel = Comment; break;
    case 'activities': EntityModel = Activity; break;
    default: return { error: { code: 'INVALID_ENTITY_TYPE', message: 'Invalid entity type' } };
  }
  const entity = await EntityModel.findOne({ _id: entityId, brand_id: brandId });
  if (!entity) {
    return { error: { code: 'ENTITY_NOT_FOUND', message: `${entityType.slice(0, -1)} not found in this brand` } };
  }
  return { entity };
};

// Get all notifications for a specific brand
const getBrandNotifications = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      category, 
      priority, 
      recipient, 
      created_by,
      date_from,
      date_to,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = { brand_id: brandId };

    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (recipient) query.recipient = recipient;
    if (created_by) query.created_by = created_by;

    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) query.created_at.$gte = new Date(date_from);
      if (date_to) query.created_at.$lte = new Date(date_to);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting brand notifications:', error);
    res.status(500).json({ success: false, error: { code: 'GET_BRAND_NOTIFICATIONS_ERROR', message: error.message } });
  }
};

// Get notification details within a brand
const getBrandNotificationById = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const notification = await Notification.findOne({ _id: id, brand_id: brandId })
      .populate('recipient', 'name email avatar')
      .populate('created_by', 'name email avatar');

    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found in this brand' } });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error getting brand notification by ID:', error);
    res.status(500).json({ success: false, error: { code: 'GET_BRAND_NOTIFICATION_BY_ID_ERROR', message: error.message } });
  }
};

// Get user notifications within a brand
const getUserNotifications = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      category, 
      priority,
      unread_only = false,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const query = { brand_id: brandId, recipient: userId };

    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    if (unread_only === 'true') {
      query.status = { $in: ['pending', 'sent', 'delivered'] };
    }

    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

    const notifications = await Notification.find(query)
      .populate('created_by', 'name email avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ success: false, error: { code: 'GET_USER_NOTIFICATIONS_ERROR', message: error.message } });
  }
};

// Create notification within a brand
const createBrandNotification = async (req, res) => {
  try {
    const { brandId } = req.params;
    const {
      recipient,
      type,
      category,
      priority = 'medium',
      title,
      message,
      content,
      actions,
      related_entities,
      metadata,
      scheduled_for,
      expires_at,
      delivery_methods = ['in_app'],
      preferences_override,
      group_id,
      thread_id,
      tags,
      visibility = 'private',
      importance = 'normal',
      source = 'user',
      template_id,
      template_variables,
      attachments,
      links,
      settings
    } = req.body;

    if (!recipient || !type || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Recipient, type, title, and message are required' } 
      });
    }

    // Validate recipient exists and has access to brand
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ success: false, error: { code: 'RECIPIENT_NOT_FOUND', message: 'Recipient user not found' } });
    }

    // Check if recipient has access to brand (simplified check)
    // In a real implementation, you'd check UserBrand relationship

    const notification = await Notification.create({
      brand_id: brandId,
      recipient,
      created_by: req.user.id,
      type,
      category,
      priority,
      title,
      message,
      content,
      actions,
      related_entities,
      metadata,
      scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined,
      expires_at: expires_at ? new Date(expires_at) : undefined,
      delivery_methods,
      preferences_override,
      group_id,
      thread_id,
      tags,
      visibility,
      importance,
      source,
      template_id,
      template_variables,
      attachments,
      links,
      settings
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error creating brand notification:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_BRAND_NOTIFICATION_ERROR', message: error.message } });
  }
};

// Update notification within a brand
const updateBrandNotification = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const {
      title,
      message,
      content,
      actions,
      metadata,
      scheduled_for,
      expires_at,
      delivery_methods,
      preferences_override,
      tags,
      visibility,
      importance,
      settings
    } = req.body;

    const notification = await Notification.findOne({ _id: id, brand_id: brandId });
    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found in this brand' } });
    }

    // Check if user has permission to update (creator or admin/manager)
    if (notification.created_by.toString() !== req.user.id && !req.user.roles.includes('admin') && !req.user.roles.includes('manager')) {
      return res.status(403).json({ success: false, error: { code: 'PERMISSION_DENIED', message: 'You do not have permission to update this notification' } });
    }

    // Update fields
    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (content !== undefined) notification.content = content;
    if (actions !== undefined) notification.actions = actions;
    if (metadata !== undefined) notification.metadata = metadata;
    if (scheduled_for !== undefined) notification.scheduled_for = scheduled_for ? new Date(scheduled_for) : undefined;
    if (expires_at !== undefined) notification.expires_at = expires_at ? new Date(expires_at) : undefined;
    if (delivery_methods !== undefined) notification.delivery_methods = delivery_methods;
    if (preferences_override !== undefined) notification.preferences_override = preferences_override;
    if (tags !== undefined) notification.tags = tags;
    if (visibility !== undefined) notification.visibility = visibility;
    if (importance !== undefined) notification.importance = importance;
    if (settings !== undefined) notification.settings = settings;

    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error updating brand notification:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_BRAND_NOTIFICATION_ERROR', message: error.message } });
  }
};

// Delete notification within a brand
const deleteBrandNotification = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const notification = await Notification.findOne({ _id: id, brand_id: brandId });

    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found in this brand' } });
    }

    // Check if user has permission to delete (creator or admin/manager)
    if (notification.created_by.toString() !== req.user.id && !req.user.roles.includes('admin') && !req.user.roles.includes('manager')) {
      return res.status(403).json({ success: false, error: { code: 'PERMISSION_DENIED', message: 'You do not have permission to delete this notification' } });
    }

    await Notification.deleteOne({ _id: id, brand_id: brandId });

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand notification:', error);
    res.status(500).json({ success: false, error: { code: 'DELETE_BRAND_NOTIFICATION_ERROR', message: error.message } });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, brand_id: brandId, recipient: userId },
      { 
        $set: { 
          status: 'read',
          'delivery_tracking.read_at': new Date()
        },
        $push: {
          history: {
            action: 'read',
            timestamp: new Date(),
            user_id: userId
          }
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found or you are not the recipient' } });
    }

    res.status(200).json({ success: true, data: notification, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: { code: 'MARK_NOTIFICATION_AS_READ_ERROR', message: error.message } });
  }
};

// Mark multiple notifications as read
const markMultipleNotificationsAsRead = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { notification_ids } = req.body;
    const userId = req.user.id;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'notification_ids array is required' } });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notification_ids }, brand_id: brandId, recipient: userId },
      { 
        $set: { 
          status: 'read',
          'delivery_tracking.read_at': new Date()
        },
        $push: {
          history: {
            action: 'read',
            timestamp: new Date(),
            user_id: userId
          }
        }
      }
    );

    res.status(200).json({ success: true, data: { modifiedCount: result.modifiedCount }, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking multiple notifications as read:', error);
    res.status(500).json({ success: false, error: { code: 'MARK_MULTIPLE_NOTIFICATIONS_AS_READ_ERROR', message: error.message } });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { brand_id: brandId, recipient: userId, status: { $in: ['pending', 'sent', 'delivered'] } },
      { 
        $set: { 
          status: 'read',
          'delivery_tracking.read_at': new Date()
        },
        $push: {
          history: {
            action: 'read',
            timestamp: new Date(),
            user_id: userId
          }
        }
      }
    );

    res.status(200).json({ success: true, data: { modifiedCount: result.modifiedCount }, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: { code: 'MARK_ALL_NOTIFICATIONS_AS_READ_ERROR', message: error.message } });
  }
};

// Archive notification
const archiveNotification = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, brand_id: brandId, recipient: userId },
      { 
        $set: { status: 'archived' },
        $push: {
          history: {
            action: 'archived',
            timestamp: new Date(),
            user_id: userId
          }
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: { code: 'NOTIFICATION_NOT_FOUND', message: 'Notification not found or you are not the recipient' } });
    }

    res.status(200).json({ success: true, data: notification, message: 'Notification archived' });
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({ success: false, error: { code: 'ARCHIVE_NOTIFICATION_ERROR', message: error.message } });
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    let preferences = await NotificationPreference.findOne({ user_id: userId, brand_id: brandId });
    
    if (!preferences) {
      preferences = await NotificationPreference.createDefault(userId, brandId);
    }

    res.status(200).json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ success: false, error: { code: 'GET_NOTIFICATION_PREFERENCES_ERROR', message: error.message } });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;
    const preferences = req.body;

    const updatedPreferences = await NotificationPreference.updatePreferences(userId, brandId, preferences);

    res.status(200).json({ success: true, data: updatedPreferences, message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_NOTIFICATION_PREFERENCES_ERROR', message: error.message } });
  }
};

// Get notification analytics
const getNotificationAnalytics = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { date_from, date_to, group_by = 'day' } = req.query;

    const matchQuery = { brand_id: brandId };
    if (date_from || date_to) {
      matchQuery.created_at = {};
      if (date_from) matchQuery.created_at.$gte = new Date(date_from);
      if (date_to) matchQuery.created_at.$lte = new Date(date_to);
    }

    const analytics = await Notification.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          readNotifications: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          unreadNotifications: { $sum: { $cond: [{ $in: ['$status', ['pending', 'sent', 'delivered']] }, 1, 0] } },
          failedNotifications: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          notificationsByType: {
            $push: {
              type: '$type',
              category: '$category',
              priority: '$priority',
              status: '$status'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalNotifications: 1,
          readNotifications: 1,
          unreadNotifications: 1,
          failedNotifications: 1,
          readRate: { $divide: ['$readNotifications', '$totalNotifications'] },
          failureRate: { $divide: ['$failedNotifications', '$totalNotifications'] }
        }
      }
    ]);

    // Get notifications by type
    const notificationsByType = await Notification.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get notifications by category
    const notificationsByCategory = await Notification.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get notifications by priority
    const notificationsByPriority = await Notification.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: analytics[0] || {
          totalNotifications: 0,
          readNotifications: 0,
          unreadNotifications: 0,
          failedNotifications: 0,
          readRate: 0,
          failureRate: 0
        },
        notificationsByType,
        notificationsByCategory,
        notificationsByPriority
      }
    });
  } catch (error) {
    console.error('Error getting notification analytics:', error);
    res.status(500).json({ success: false, error: { code: 'GET_NOTIFICATION_ANALYTICS_ERROR', message: error.message } });
  }
};

// Search notifications
const searchNotifications = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Search query (q) is required' } });
    }

    const query = {
      brand_id: brandId,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    };

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email avatar')
      .populate('created_by', 'name email avatar')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error searching notifications:', error);
    res.status(500).json({ success: false, error: { code: 'SEARCH_NOTIFICATIONS_ERROR', message: error.message } });
  }
};

// Export notifications
const exportNotifications = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { format = 'json', date_from, date_to, type, category, status } = req.query;

    const query = { brand_id: brandId };
    if (date_from || date_to) {
      query.created_at = {};
      if (date_from) query.created_at.$gte = new Date(date_from);
      if (date_to) query.created_at.$lte = new Date(date_to);
    }
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email')
      .populate('created_by', 'name email')
      .lean();

    if (format === 'csv') {
      // Implement CSV conversion logic here
      return res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'CSV export not yet implemented' } });
    }

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error exporting notifications:', error);
    res.status(500).json({ success: false, error: { code: 'EXPORT_NOTIFICATIONS_ERROR', message: error.message } });
  }
};

module.exports = {
  getBrandNotifications,
  getBrandNotificationById,
  getUserNotifications,
  createBrandNotification,
  updateBrandNotification,
  deleteBrandNotification,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationAnalytics,
  searchNotifications,
  exportNotifications
};
