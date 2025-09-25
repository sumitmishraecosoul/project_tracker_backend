const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  // Brand isolation
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true,
  },

  // User
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Global notification settings
  global_settings: {
    email_notifications: {
      type: Boolean,
      default: true
    },
    in_app_notifications: {
      type: Boolean,
      default: true
    },
    sms_notifications: {
      type: Boolean,
      default: false
    },
    push_notifications: {
      type: Boolean,
      default: true
    },
    digest_notifications: {
      type: Boolean,
      default: true
    },
    real_time_notifications: {
      type: Boolean,
      default: true
    }
  },

  // Notification frequency settings
  frequency: {
    immediate: {
      type: Boolean,
      default: true
    },
    daily_digest: {
      type: Boolean,
      default: true
    },
    weekly_digest: {
      type: Boolean,
      default: false
    },
    digest_time: {
      type: String,
      default: '09:00'
    },
    digest_timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Quiet hours settings
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
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['saturday', 'sunday']
    }]
  },

  // Category-specific preferences
  category_preferences: {
    task: {
      email: {
        type: Boolean,
        default: true
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    project: {
      email: {
        type: Boolean,
        default: true
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    comment: {
      email: {
        type: Boolean,
        default: false
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    system: {
      email: {
        type: Boolean,
        default: true
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    brand: {
      email: {
        type: Boolean,
        default: true
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    activity: {
      email: {
        type: Boolean,
        default: false
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    file: {
      email: {
        type: Boolean,
        default: false
      },
      in_app: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },

  // Type-specific preferences
  type_preferences: {
    // Task notifications
    task_assigned: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    task_status_changed: {
      email: { type: Boolean, default: false },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    task_due_date_reminder: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    task_overdue: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    task_completed: {
      email: { type: Boolean, default: false },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false }
    },
    task_comment_added: {
      email: { type: Boolean, default: false },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    task_comment_mentioned: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },

    // Project notifications
    project_created: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    project_status_changed: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    project_completed: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    project_deadline_reminder: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    project_overdue: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },

    // Comment notifications
    comment_added: {
      email: { type: Boolean, default: false },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    comment_replied: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    comment_mentioned: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },

    // System notifications
    system_maintenance: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    system_update: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    system_security_alert: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },

    // Brand notifications
    brand_invitation: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    brand_role_changed: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },

  // Priority-based preferences
  priority_preferences: {
    low: {
      email: { type: Boolean, default: false },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false }
    },
    medium: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    high: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    urgent: {
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },

  // Advanced settings
  advanced_settings: {
    batch_notifications: {
      type: Boolean,
      default: true
    },
    batch_size: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    batch_interval: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: 60,
      max: 3600
    },
    max_notifications_per_day: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000
    },
    notification_cooldown: {
      type: Number,
      default: 60, // 1 minute in seconds
      min: 0,
      max: 3600
    }
  },

  // Email settings
  email_settings: {
    email_format: {
      type: String,
      enum: ['html', 'text', 'both'],
      default: 'html'
    },
    email_footer: {
      type: String,
      maxlength: 500
    },
    unsubscribe_link: {
      type: Boolean,
      default: true
    },
    branding: {
      logo_url: String,
      primary_color: String,
      secondary_color: String
    }
  },

  // Mobile settings
  mobile_settings: {
    push_sound: {
      type: Boolean,
      default: true
    },
    push_vibration: {
      type: Boolean,
      default: true
    },
    push_badge: {
      type: Boolean,
      default: true
    }
  },

  // Notification templates
  templates: {
    email_template: {
      type: String,
      maxlength: 100
    },
    sms_template: {
      type: String,
      maxlength: 100
    },
    push_template: {
      type: String,
      maxlength: 100
    }
  },

  // Notification history
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'reset', 'imported', 'exported']
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

  // Settings version for migration
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'notification_preferences'
});

// Indexes
notificationPreferenceSchema.index({ brand_id: 1, user_id: 1 }, { unique: true });
notificationPreferenceSchema.index({ user_id: 1 });
notificationPreferenceSchema.index({ brand_id: 1 });

// Static methods
notificationPreferenceSchema.statics.findByUser = function(userId, brandId) {
  return this.findOne({ user_id: userId, brand_id: brandId });
};

notificationPreferenceSchema.statics.createDefault = function(userId, brandId) {
  return this.create({
    brand_id: brandId,
    user_id: userId
  });
};

notificationPreferenceSchema.statics.updatePreferences = function(userId, brandId, preferences) {
  return this.findOneAndUpdate(
    { user_id: userId, brand_id: brandId },
    { 
      $set: preferences,
      $push: {
        history: {
          action: 'updated',
          timestamp: new Date(),
          user_id: userId,
          details: { updated_fields: Object.keys(preferences) }
        }
      }
    },
    { upsert: true, new: true }
  );
};

// Instance methods
notificationPreferenceSchema.methods.getDeliveryMethods = function(notificationType, category, priority) {
  const methods = [];
  
  // Check global settings
  if (this.global_settings.email_notifications) methods.push('email');
  if (this.global_settings.in_app_notifications) methods.push('in_app');
  if (this.global_settings.sms_notifications) methods.push('sms');
  if (this.global_settings.push_notifications) methods.push('push');
  
  // Check category preferences
  if (this.category_preferences[category]) {
    const categoryPrefs = this.category_preferences[category];
    if (!categoryPrefs.email) methods.splice(methods.indexOf('email'), 1);
    if (!categoryPrefs.in_app) methods.splice(methods.indexOf('in_app'), 1);
    if (!categoryPrefs.sms) methods.splice(methods.indexOf('sms'), 1);
    if (!categoryPrefs.push) methods.splice(methods.indexOf('push'), 1);
  }
  
  // Check type preferences
  if (this.type_preferences[notificationType]) {
    const typePrefs = this.type_preferences[notificationType];
    if (!typePrefs.email) methods.splice(methods.indexOf('email'), 1);
    if (!typePrefs.in_app) methods.splice(methods.indexOf('in_app'), 1);
    if (!typePrefs.sms) methods.splice(methods.indexOf('sms'), 1);
    if (!typePrefs.push) methods.splice(methods.indexOf('push'), 1);
  }
  
  // Check priority preferences
  if (this.priority_preferences[priority]) {
    const priorityPrefs = this.priority_preferences[priority];
    if (!priorityPrefs.email) methods.splice(methods.indexOf('email'), 1);
    if (!priorityPrefs.in_app) methods.splice(methods.indexOf('in_app'), 1);
    if (!priorityPrefs.sms) methods.splice(methods.indexOf('sms'), 1);
    if (!priorityPrefs.push) methods.splice(methods.indexOf('push'), 1);
  }
  
  return methods;
};

notificationPreferenceSchema.methods.isQuietHours = function() {
  if (!this.quiet_hours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if current day is in quiet hours days
  if (!this.quiet_hours.days.includes(currentDay)) return false;
  
  // Check if current time is within quiet hours
  const startTime = this.quiet_hours.start_time;
  const endTime = this.quiet_hours.end_time;
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime <= endTime;
  }
};

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
