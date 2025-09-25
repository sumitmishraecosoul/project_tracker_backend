const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

class NotificationService {
  // Create notification for task assignment
  static async createTaskAssignmentNotification(brandId, taskId, assigneeId, assignedBy) {
    try {
      const task = await Task.findById(taskId).populate('project', 'title');
      const assignee = await User.findById(assigneeId);
      const assigner = await User.findById(assignedBy);

      if (!task || !assignee || !assigner) return null;

      const notification = await Notification.create({
        brand_id: brandId,
        recipient: assigneeId,
        created_by: assignedBy,
        type: 'task_assigned',
        category: 'task',
        priority: 'medium',
        title: `Task Assigned: ${task.task}`,
        message: `${assigner.name} assigned you a task: ${task.task}`,
        content: `You have been assigned to work on "${task.task}" in project "${task.project.title}".`,
        related_entities: {
          task_id: taskId,
          project_id: task.project._id
        },
        metadata: {
          task_title: task.task,
          project_title: task.project.title,
          assigner_name: assigner.name,
          due_date: task.eta
        },
        actions: [
          {
            label: 'View Task',
            action: 'view_task',
            url: `/tasks/${taskId}`,
            method: 'GET'
          }
        ],
        tags: ['task', 'assignment'],
        visibility: 'private'
      });

      return notification;
    } catch (error) {
      console.error('Error creating task assignment notification:', error);
      return null;
    }
  }

  // Create notification for task status change
  static async createTaskStatusChangeNotification(brandId, taskId, oldStatus, newStatus, changedBy) {
    try {
      const task = await Task.findById(taskId).populate('project', 'title').populate('assignedTo', 'name email');
      const changer = await User.findById(changedBy);

      if (!task || !changer) return null;

      // Get all users who should be notified (assignees, project team, etc.)
      const recipients = [];
      if (task.assignedTo && task.assignedTo.length > 0) {
        recipients.push(...task.assignedTo.map(user => user._id));
      }

      const notifications = [];
      for (const recipientId of recipients) {
        if (recipientId.toString() !== changedBy.toString()) {
          const notification = await Notification.create({
            brand_id: brandId,
            recipient: recipientId,
            created_by: changedBy,
            type: 'task_status_changed',
            category: 'task',
            priority: 'medium',
            title: `Task Status Changed: ${task.task}`,
            message: `${changer.name} changed the status of "${task.task}" from ${oldStatus} to ${newStatus}`,
            content: `The task "${task.task}" in project "${task.project.title}" has been updated from ${oldStatus} to ${newStatus}.`,
            related_entities: {
              task_id: taskId,
              project_id: task.project._id
            },
            metadata: {
              task_title: task.task,
              project_title: task.project.title,
              old_status: oldStatus,
              new_status: newStatus,
              changer_name: changer.name
            },
            actions: [
              {
                label: 'View Task',
                action: 'view_task',
                url: `/tasks/${taskId}`,
                method: 'GET'
              }
            ],
            tags: ['task', 'status_change'],
            visibility: 'private'
          });
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating task status change notification:', error);
      return [];
    }
  }

  // Create notification for task due date reminder
  static async createTaskDueDateReminderNotification(brandId, taskId, reminderType = 'due_soon') {
    try {
      const task = await Task.findById(taskId).populate('project', 'title').populate('assignedTo', 'name email');
      
      if (!task || !task.assignedTo || task.assignedTo.length === 0) return [];

      const now = new Date();
      const dueDate = new Date(task.eta);
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let title, message, priority;
      
      if (reminderType === 'due_soon' && daysDiff <= 1) {
        title = `Task Due Soon: ${task.task}`;
        message = `Your task "${task.task}" is due soon (${daysDiff} day${daysDiff !== 1 ? 's' : ''} remaining)`;
        priority = 'high';
      } else if (reminderType === 'overdue' && daysDiff < 0) {
        title = `Task Overdue: ${task.task}`;
        message = `Your task "${task.task}" is overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`;
        priority = 'urgent';
      } else {
        return []; // No notification needed
      }

      const notifications = [];
      for (const assignee of task.assignedTo) {
        const notification = await Notification.create({
          brand_id: brandId,
          recipient: assignee._id,
          created_by: null, // System notification
          type: reminderType === 'overdue' ? 'task_overdue' : 'task_due_date_reminder',
          category: 'task',
          priority: priority,
          title: title,
          message: message,
          content: `The task "${task.task}" in project "${task.project.title}" ${reminderType === 'overdue' ? 'is overdue' : 'is due soon'}.`,
          related_entities: {
            task_id: taskId,
            project_id: task.project._id
          },
          metadata: {
            task_title: task.task,
            project_title: task.project.title,
            due_date: task.eta,
            days_remaining: daysDiff,
            reminder_type: reminderType
          },
          actions: [
            {
              label: 'View Task',
              action: 'view_task',
              url: `/tasks/${taskId}`,
              method: 'GET'
            }
          ],
          tags: ['task', 'reminder', reminderType],
          visibility: 'private',
          source: 'system',
          flags: {
            is_automated: true
          }
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating task due date reminder notification:', error);
      return [];
    }
  }

  // Create notification for project status change
  static async createProjectStatusChangeNotification(brandId, projectId, oldStatus, newStatus, changedBy) {
    try {
      const project = await Project.findById(projectId).populate('teamMembers', 'name email');
      const changer = await User.findById(changedBy);

      if (!project || !changer) return null;

      const notifications = [];
      for (const teamMember of project.teamMembers) {
        if (teamMember._id.toString() !== changedBy.toString()) {
          const notification = await Notification.create({
            brand_id: brandId,
            recipient: teamMember._id,
            created_by: changedBy,
            type: 'project_status_changed',
            category: 'project',
            priority: 'medium',
            title: `Project Status Changed: ${project.title}`,
            message: `${changer.name} changed the status of project "${project.title}" from ${oldStatus} to ${newStatus}`,
            content: `The project "${project.title}" status has been updated from ${oldStatus} to ${newStatus}.`,
            related_entities: {
              project_id: projectId
            },
            metadata: {
              project_title: project.title,
              old_status: oldStatus,
              new_status: newStatus,
              changer_name: changer.name
            },
            actions: [
              {
                label: 'View Project',
                action: 'view_project',
                url: `/projects/${projectId}`,
                method: 'GET'
              }
            ],
            tags: ['project', 'status_change'],
            visibility: 'team'
          });
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating project status change notification:', error);
      return [];
    }
  }

  // Create notification for comment added
  static async createCommentAddedNotification(brandId, commentId, entityType, entityId, commenterId) {
    try {
      const comment = await Comment.findById(commentId).populate('createdBy', 'name email');
      const commenter = await User.findById(commenterId);

      if (!comment || !commenter) return null;

      // Get entity and its team members
      let entity, teamMembers = [];
      
      if (entityType === 'tasks') {
        entity = await Task.findById(entityId).populate('assignedTo', 'name email').populate('project', 'title');
        if (entity && entity.assignedTo) {
          teamMembers = entity.assignedTo;
        }
      } else if (entityType === 'projects') {
        entity = await Project.findById(entityId).populate('teamMembers', 'name email');
        if (entity && entity.teamMembers) {
          teamMembers = entity.teamMembers;
        }
      }

      if (!entity) return [];

      const notifications = [];
      for (const member of teamMembers) {
        if (member._id.toString() !== commenterId.toString()) {
          const notification = await Notification.create({
            brand_id: brandId,
            recipient: member._id,
            created_by: commenterId,
            type: 'comment_added',
            category: 'comment',
            priority: 'low',
            title: `New Comment: ${entity.title || entity.task}`,
            message: `${commenter.name} commented on ${entityType.slice(0, -1)} "${entity.title || entity.task}"`,
            content: `A new comment has been added to ${entityType.slice(0, -1)} "${entity.title || entity.task}".`,
            related_entities: {
              [`${entityType.slice(0, -1)}_id`]: entityId,
              comment_id: commentId
            },
            metadata: {
              entity_title: entity.title || entity.task,
              entity_type: entityType,
              commenter_name: commenter.name,
              comment_preview: comment.content.substring(0, 100)
            },
            actions: [
              {
                label: 'View Comment',
                action: 'view_comment',
                url: `/${entityType}/${entityId}#comment-${commentId}`,
                method: 'GET'
              }
            ],
            tags: ['comment', 'collaboration'],
            visibility: 'team'
          });
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating comment added notification:', error);
      return [];
    }
  }

  // Create notification for user mention
  static async createUserMentionNotification(brandId, mentionedUserId, mentionerId, entityType, entityId, content) {
    try {
      const mentioner = await User.findById(mentionerId);
      const mentionedUser = await User.findById(mentionedUserId);

      if (!mentioner || !mentionedUser) return null;

      let entity;
      if (entityType === 'tasks') {
        entity = await Task.findById(entityId);
      } else if (entityType === 'projects') {
        entity = await Project.findById(entityId);
      }

      if (!entity) return null;

      const notification = await Notification.create({
        brand_id: brandId,
        recipient: mentionedUserId,
        created_by: mentionerId,
        type: 'comment_mentioned',
        category: 'comment',
        priority: 'medium',
        title: `You were mentioned`,
        message: `${mentioner.name} mentioned you in a comment`,
        content: `You were mentioned by ${mentioner.name} in a comment on ${entityType.slice(0, -1)} "${entity.title || entity.task}".`,
        related_entities: {
          [`${entityType.slice(0, -1)}_id`]: entityId
        },
        metadata: {
          entity_title: entity.title || entity.task,
          entity_type: entityType,
          mentioner_name: mentioner.name,
          content_preview: content.substring(0, 100)
        },
        actions: [
          {
            label: 'View Comment',
            action: 'view_comment',
            url: `/${entityType}/${entityId}`,
            method: 'GET'
          }
        ],
        tags: ['mention', 'comment'],
        visibility: 'private'
      });

      return notification;
    } catch (error) {
      console.error('Error creating user mention notification:', error);
      return null;
    }
  }

  // Create system notification
  static async createSystemNotification(brandId, type, title, message, recipients = [], priority = 'medium') {
    try {
      const notifications = [];
      
      for (const recipientId of recipients) {
        const notification = await Notification.create({
          brand_id: brandId,
          recipient: recipientId,
          created_by: null, // System notification
          type: type,
          category: 'system',
          priority: priority,
          title: title,
          message: message,
          content: message,
          metadata: {
            system_notification: true,
            notification_type: type
          },
          tags: ['system', type],
          visibility: 'public',
          source: 'system',
          flags: {
            is_system: true,
            is_automated: true
          }
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating system notification:', error);
      return [];
    }
  }

  // Process notification delivery
  static async processNotificationDelivery(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) return false;

      // Get user preferences
      const preferences = await NotificationPreference.findOne({
        user_id: notification.recipient,
        brand_id: notification.brand_id
      });

      if (!preferences) {
        // Create default preferences
        await NotificationPreference.createDefault(notification.recipient, notification.brand_id);
        return await this.processNotificationDelivery(notificationId);
      }

      // Check if user should receive this notification
      const deliveryMethods = preferences.getDeliveryMethods(
        notification.type,
        notification.category,
        notification.priority
      );

      if (deliveryMethods.length === 0) {
        // Mark as delivered but not sent
        notification.status = 'delivered';
        notification.delivery_tracking.delivered_at = new Date();
        await notification.save();
        return true;
      }

      // Check quiet hours
      if (preferences.isQuietHours() && !notification.flags.is_urgent) {
        // Schedule for later
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM
        notification.scheduled_for = tomorrow;
        await notification.save();
        return true;
      }

      // Process delivery methods
      for (const method of deliveryMethods) {
        switch (method) {
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          case 'in_app':
            // In-app notifications are already in the database
            break;
          case 'sms':
            await this.sendSMSNotification(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
        }
      }

      // Mark as delivered
      notification.status = 'delivered';
      notification.delivery_tracking.delivered_at = new Date();
      await notification.save();

      return true;
    } catch (error) {
      console.error('Error processing notification delivery:', error);
      await Notification.findByIdAndUpdate(notificationId, {
        status: 'failed',
        'delivery_tracking.failed_at': new Date(),
        'delivery_tracking.failure_reason': error.message
      });
      return false;
    }
  }

  // Send email notification (placeholder)
  static async sendEmailNotification(notification) {
    // Implement email sending logic here
    console.log(`Sending email notification to ${notification.recipient}: ${notification.title}`);
    return true;
  }

  // Send SMS notification (placeholder)
  static async sendSMSNotification(notification) {
    // Implement SMS sending logic here
    console.log(`Sending SMS notification to ${notification.recipient}: ${notification.title}`);
    return true;
  }

  // Send push notification (placeholder)
  static async sendPushNotification(notification) {
    // Implement push notification logic here
    console.log(`Sending push notification to ${notification.recipient}: ${notification.title}`);
    return true;
  }

  // Get notification statistics
  static async getNotificationStats(brandId, userId = null) {
    try {
      const matchQuery = { brand_id: brandId };
      if (userId) {
        matchQuery.recipient = userId;
      }

      const stats = await Notification.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
            unread: { $sum: { $cond: [{ $in: ['$status', ['pending', 'sent', 'delivered']] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
          }
        }
      ]);

      return stats[0] || { total: 0, read: 0, unread: 0, failed: 0 };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, read: 0, unread: 0, failed: 0 };
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        created_at: { $lt: cutoffDate },
        status: { $in: ['read', 'archived'] }
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;
