const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Brand isolation
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },

  // Notification recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification creator (who triggered the notification)
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification type and category
  type: {
    type: String,
    required: true,
    enum: [
      // Task notifications
      'task_assigned',
      'task_unassigned',
      'task_status_changed',
      'task_priority_changed',
      'task_due_date_reminder',
      'task_overdue',
      'task_completed',
      'task_reopened',
      'task_comment_added',
      'task_comment_mentioned',
      'task_subtask_added',
      'task_subtask_completed',
      'task_dependency_added',
      'task_dependency_completed',
      
      // Project notifications
      'project_created',
      'project_updated',
      'project_status_changed',
      'project_completed',
      'project_archived',
      'project_shared',
      'project_deadline_reminder',
      'project_overdue',
      'project_team_member_added',
      'project_team_member_removed',
      'project_team_member_role_changed',
      
      // Comment notifications
      'comment_added',
      'comment_replied',
      'comment_mentioned',
      'comment_reacted',
      'comment_edited',
      'comment_deleted',
      
      // System notifications
      'system_maintenance',
      'system_update',
      'system_security_alert',
      'system_backup_completed',
      'system_error',
      'system_warning',
      
      // Brand notifications
      'brand_invitation',
      'brand_role_changed',
      'brand_settings_updated',
      'brand_user_added',
      'brand_user_removed',
      
      // Activity notifications
      'activity_created',
      'activity_updated',
      'activity_archived',
      'activity_mentioned',
      
      // File notifications
      'file_uploaded',
      'file_downloaded',
      'file_shared',
      'file_deleted',
      'file_updated'
    ],
    index: true
  },

  // Notification category for grouping
  category: {
    type: String,
    required: true,
    enum: ['task', 'project', 'comment', 'system', 'brand', 'activity', 'file'],
    index: true
  },

  // Notification priority
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Notification status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'read', 'archived', 'failed'],
    default: 'pending',
    index: true
  },

  // Delivery methods
  delivery_methods: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    default: ['in_app']
  }],

  // Notification content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  message: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Rich content for advanced notifications
  content: {
    type: String,
    maxlength: 5000
  },

  // Action buttons for notifications
  actions: [{
    label: {
      type: String,
      required: true,
      maxlength: 50
    },
    action: {
      type: String,
      required: true,
      maxlength: 100
    },
    url: {
      type: String,
      maxlength: 500
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET'
    }
  }],

  // Related entities
  related_entities: {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    subtask_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subtask'
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    file_id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },

  // Notification metadata
  metadata: {
    // Original values before change
    old_values: mongoose.Schema.Types.Mixed,
    // New values after change
    new_values: mongoose.Schema.Types.Mixed,
    // Additional context
    context: mongoose.Schema.Types.Mixed,
    // Custom data
    custom_data: mongoose.Schema.Types.Mixed
  },

  // Notification scheduling
  scheduled_for: {
    type: Date,
    index: true
  },

  // Notification expiration
  expires_at: {
    type: Date,
    index: true
  },

  // Delivery tracking
  delivery_tracking: {
    sent_at: Date,
    delivered_at: Date,
    read_at: Date,
    failed_at: Date,
    failure_reason: String,
    retry_count: {
      type: Number,
      default: 0,
      max: 5
    },
    last_retry_at: Date
  },

  // Notification preferences override
  preferences_override: {
    email_enabled: Boolean,
    in_app_enabled: Boolean,
    sms_enabled: Boolean,
    push_enabled: Boolean
  },

  // Notification grouping
  group_id: {
    type: String,
    index: true
  },

  // Notification thread
  thread_id: {
    type: String,
    index: true
  },

  // Notification tags
  tags: [{
    type: String,
    maxlength: 50
  }],

  // Notification visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'team', 'admin'],
    default: 'private'
  },

  // Notification importance
  importance: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },

  // Notification source
  source: {
    type: String,
    enum: ['system', 'user', 'automated', 'integration'],
    default: 'system'
  },

  // Notification template
  template_id: {
    type: String,
    maxlength: 100
  },

  // Notification variables for templating
  template_variables: mongoose.Schema.Types.Mixed,

  // Notification attachments
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mime_type: String
  }],

  // Notification links
  links: [{
    label: String,
    url: String,
    type: {
      type: String,
      enum: ['internal', 'external', 'action']
    }
  }],

  // Notification analytics
  analytics: {
    open_count: {
      type: Number,
      default: 0
    },
    click_count: {
      type: Number,
      default: 0
    },
    action_count: {
      type: Number,
      default: 0
    },
    last_opened_at: Date,
    last_clicked_at: Date
  },

  // Notification settings
  settings: {
    auto_archive: {
      type: Boolean,
      default: false
    },
    auto_archive_days: {
      type: Number,
      default: 30
    },
    allow_reply: {
      type: Boolean,
      default: false
    },
    require_acknowledgment: {
      type: Boolean,
      default: false
    }
  },

  // Notification history
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'sent', 'delivered', 'read', 'archived', 'deleted']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed
  }],

  // Notification flags
  flags: {
    is_urgent: {
      type: Boolean,
      default: false
    },
    is_system: {
      type: Boolean,
      default: false
    },
    is_automated: {
      type: Boolean,
      default: false
    },
    is_bulk: {
      type: Boolean,
      default: false
    },
    is_scheduled: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Indexes for performance
notificationSchema.index({ brand_id: 1, recipient: 1, status: 1 });
notificationSchema.index({ brand_id: 1, type: 1, created_at: -1 });
notificationSchema.index({ recipient: 1, status: 1, created_at: -1 });
notificationSchema.index({ brand_id: 1, category: 1, priority: 1 });
notificationSchema.index({ scheduled_for: 1, status: 1 });
notificationSchema.index({ expires_at: 1, status: 1 });
notificationSchema.index({ group_id: 1 });
notificationSchema.index({ thread_id: 1 });
notificationSchema.index({ tags: 1 });

// Virtual for notification age
notificationSchema.virtual('age_in_hours').get(function() {
  return Math.floor((Date.now() - this.created_at) / (1000 * 60 * 60));
});

// Virtual for notification urgency
notificationSchema.virtual('is_urgent_notification').get(function() {
  return this.priority === 'urgent' || this.flags.is_urgent || this.importance === 'critical';
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default expiration if not set
  if (!this.expires_at) {
    this.expires_at = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  }

  // Set group_id if not set
  if (!this.group_id) {
    this.group_id = `${this.brand_id}_${this.type}_${this.recipient}`;
  }

  // Set thread_id if not set
  if (!this.thread_id) {
    this.thread_id = `${this.brand_id}_${this.related_entities.project_id || this.related_entities.task_id}`;
  }

  // Add to history
  this.history.push({
    action: 'created',
    timestamp: new Date(),
    user_id: this.created_by,
    details: { type: this.type, category: this.category }
  });

  next();
});

// Static methods
notificationSchema.statics.findByRecipient = function(recipientId, brandId, options = {}) {
  const query = { recipient: recipientId, brand_id: brandId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.category) {
    query.category = options.category;
  }

  return this.find(query)
    .populate('created_by', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ created_at: -1 })
    .limit(options.limit || 50);
};

notificationSchema.statics.findUnread = function(recipientId, brandId) {
  return this.find({
    recipient: recipientId,
    brand_id: brandId,
    status: { $in: ['pending', 'sent', 'delivered'] }
  }).sort({ created_at: -1 });
};

notificationSchema.statics.markAsRead = function(notificationIds, userId) {
  return this.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
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
};

// Instance methods
notificationSchema.methods.markAsRead = function(userId) {
  this.status = 'read';
  this.delivery_tracking.read_at = new Date();
  this.analytics.open_count += 1;
  this.analytics.last_opened_at = new Date();
  
  this.history.push({
    action: 'read',
    timestamp: new Date(),
    user_id: userId
  });
  
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.delivery_tracking.delivered_at = new Date();
  
  this.history.push({
    action: 'delivered',
    timestamp: new Date()
  });
  
  return this.save();
};

notificationSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.delivery_tracking.failed_at = new Date();
  this.delivery_tracking.failure_reason = reason;
  this.delivery_tracking.retry_count += 1;
  this.delivery_tracking.last_retry_at = new Date();
  
  this.history.push({
    action: 'failed',
    timestamp: new Date(),
    details: { reason }
  });
  
  return this.save();
};

notificationSchema.methods.addClick = function() {
  this.analytics.click_count += 1;
  this.analytics.last_clicked_at = new Date();
  
  this.history.push({
    action: 'clicked',
    timestamp: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);