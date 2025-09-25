const mongoose = require('mongoose');

const realtimeSubscriptionSchema = new mongoose.Schema({
  // Brand isolation
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },
  // User who is subscribed
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Task being subscribed to
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  // Project being subscribed to
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  // Type of subscription
  subscriptionType: {
    type: String,
    enum: ['comments', 'activities', 'mentions', 'all'],
    required: true,
    index: true
  },
  // Subscription status
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active',
    index: true
  },
  // Subscription preferences
  preferences: {
    // Email notifications
    email_notifications: {
      type: Boolean,
      default: true
    },
    // In-app notifications
    in_app_notifications: {
      type: Boolean,
      default: true
    },
    // Push notifications
    push_notifications: {
      type: Boolean,
      default: true
    },
    // SMS notifications
    sms_notifications: {
      type: Boolean,
      default: false
    },
    // Notification frequency
    frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily', 'weekly'],
      default: 'immediate'
    },
    // Quiet hours
    quiet_hours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start_time: {
        type: String,
        default: '22:00'
      },
      end_time: {
        type: String,
        default: '08:00'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  // Subscription analytics
  analytics: {
    total_notifications: {
      type: Number,
      default: 0
    },
    email_sent: {
      type: Number,
      default: 0
    },
    in_app_sent: {
      type: Number,
      default: 0
    },
    push_sent: {
      type: Number,
      default: 0
    },
    sms_sent: {
      type: Number,
      default: 0
    },
    last_notification_at: {
      type: Date
    }
  },
  // Subscription metadata
  metadata: {
    // WebSocket connection ID
    connection_id: String,
    // Client information
    client_info: {
      user_agent: String,
      ip_address: String,
      platform: String
    },
    // Subscription source
    source: {
      type: String,
      enum: ['manual', 'automatic', 'invitation', 'assignment'],
      default: 'manual'
    }
  },
  // Subscription timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'realtime_subscriptions'
});

// Indexes for performance
realtimeSubscriptionSchema.index({ brand_id: 1, userId: 1, taskId: 1 });
realtimeSubscriptionSchema.index({ brand_id: 1, taskId: 1, subscriptionType: 1 });
realtimeSubscriptionSchema.index({ brand_id: 1, userId: 1, status: 1 });
realtimeSubscriptionSchema.index({ brand_id: 1, lastSeenAt: -1 });

// Virtual for user details
realtimeSubscriptionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for task details
realtimeSubscriptionSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true
});

// Virtual for project details
realtimeSubscriptionSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Method to update last seen
realtimeSubscriptionSchema.methods.updateLastSeen = function() {
  this.lastSeenAt = new Date();
  return this.save();
};

// Method to pause subscription
realtimeSubscriptionSchema.methods.pause = function() {
  this.status = 'paused';
  this.updatedAt = new Date();
  return this.save();
};

// Method to resume subscription
realtimeSubscriptionSchema.methods.resume = function() {
  this.status = 'active';
  this.updatedAt = new Date();
  return this.save();
};

// Method to cancel subscription
realtimeSubscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.updatedAt = new Date();
  return this.save();
};

// Method to update preferences
realtimeSubscriptionSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  this.updatedAt = new Date();
  return this.save();
};

// Method to increment notification count
realtimeSubscriptionSchema.methods.incrementNotification = function(type = 'total') {
  this.analytics.total_notifications += 1;
  this.analytics.last_notification_at = new Date();
  
  if (type === 'email') this.analytics.email_sent += 1;
  if (type === 'in_app') this.analytics.in_app_sent += 1;
  if (type === 'push') this.analytics.push_sent += 1;
  if (type === 'sms') this.analytics.sms_sent += 1;
  
  return this.save();
};

// Method to get subscription statistics
realtimeSubscriptionSchema.methods.getStatistics = function() {
  return {
    total_notifications: this.analytics.total_notifications,
    email_sent: this.analytics.email_sent,
    in_app_sent: this.analytics.in_app_sent,
    push_sent: this.analytics.push_sent,
    sms_sent: this.analytics.sms_sent,
    last_notification_at: this.analytics.last_notification_at,
    is_active: this.status === 'active',
    is_paused: this.status === 'paused',
    is_cancelled: this.status === 'cancelled'
  };
};

// Static method to get active subscriptions for a task
realtimeSubscriptionSchema.statics.getActiveSubscriptions = function(brandId, taskId, subscriptionType = 'all') {
  const query = {
    brand_id: brandId,
    taskId: taskId,
    status: 'active'
  };
  
  if (subscriptionType !== 'all') {
    query.subscriptionType = subscriptionType;
  }
  
  return this.find(query)
    .populate('userId', 'name email avatar')
    .populate('taskId', 'title')
    .populate('projectId', 'title');
};

// Static method to get user subscriptions
realtimeSubscriptionSchema.statics.getUserSubscriptions = function(brandId, userId, options = {}) {
  const query = {
    brand_id: brandId,
    userId: userId
  };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.subscriptionType) {
    query.subscriptionType = options.subscriptionType;
  }
  
  return this.find(query)
    .populate('taskId', 'title')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0);
};

// Static method to create subscription
realtimeSubscriptionSchema.statics.createSubscription = function(brandId, userId, taskId, projectId, subscriptionType, preferences = {}) {
  return this.create({
    brand_id: brandId,
    userId: userId,
    taskId: taskId,
    projectId: projectId,
    subscriptionType: subscriptionType,
    preferences: {
      email_notifications: true,
      in_app_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      frequency: 'immediate',
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'UTC'
      },
      ...preferences
    }
  });
};

// Static method to get subscription analytics
realtimeSubscriptionSchema.statics.getSubscriptionAnalytics = function(brandId, taskId) {
  return this.aggregate([
    { $match: { brand_id: mongoose.Types.ObjectId(brandId), taskId: mongoose.Types.ObjectId(taskId) } },
    {
      $group: {
        _id: null,
        total_subscriptions: { $sum: 1 },
        active_subscriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        paused_subscriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
        },
        cancelled_subscriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        total_notifications: { $sum: '$analytics.total_notifications' },
        email_notifications: { $sum: '$analytics.email_sent' },
        in_app_notifications: { $sum: '$analytics.in_app_sent' },
        push_notifications: { $sum: '$analytics.push_sent' },
        sms_notifications: { $sum: '$analytics.sms_sent' }
      }
    }
  ]);
};

// Pre-save middleware to update timestamps
realtimeSubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('RealtimeSubscription', realtimeSubscriptionSchema);

