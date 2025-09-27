const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Brand isolation
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },

  // Activity creator
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Activity type
  type: {
    type: String,
    required: true,
    enum: [
      // Task activities
      'task_created', 'task_updated', 'task_deleted', 'task_assigned', 'task_unassigned',
      'task_status_changed', 'task_priority_changed', 'task_due_date_changed',
      'task_completed', 'task_reopened', 'task_archived', 'task_restored',
      
      // Project activities
      'project_created', 'project_updated', 'project_deleted', 'project_archived',
      'project_restored', 'project_status_changed', 'project_priority_changed',
      
      // Subtask activities
      'subtask_created', 'subtask_updated', 'subtask_deleted', 'subtask_completed',
      'subtask_reopened', 'subtask_assigned', 'subtask_unassigned',
      
      // Comment activities
      'comment_added', 'comment_updated', 'comment_deleted', 'comment_mentioned',
      'comment_reaction_added', 'comment_reaction_removed',
      
      // User activities
      'user_joined', 'user_left', 'user_role_changed', 'user_invited',
      
      // Brand activities
      'brand_created', 'brand_updated', 'brand_deleted', 'brand_settings_changed',
      
      // System activities
      'system_notification', 'system_alert', 'system_maintenance'
    ],
    index: true
  },

  // Activity title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  // Activity description
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Activity metadata
  metadata: {
    entity_type: {
      type: String,
      enum: ['task', 'project', 'subtask', 'user', 'brand', 'comment', 'system'],
      required: true
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    entity_title: String,
    entity_url: String,
    old_values: mongoose.Schema.Types.Mixed,
    new_values: mongoose.Schema.Types.Mixed,
    additional_data: mongoose.Schema.Types.Mixed
  },

  // Activity recipients
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['primary', 'secondary', 'observer', 'mentioned'],
      default: 'secondary'
    },
    notification_sent: {
      type: Boolean,
      default: false
    },
    notification_sent_at: Date,
    read: {
      type: Boolean,
      default: false
    },
    read_at: Date,
    notified: {
      type: Boolean,
      default: false
    },
    notified_at: Date
  }],

  // Activity status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  },

  // Activity priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },

  // Activity visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public',
    index: true
  },

  // Activity tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Activity analytics
  analytics: {
    view_count: {
      type: Number,
      default: 0
    },
    interaction_count: {
      type: Number,
      default: 0
    },
    share_count: {
      type: Number,
      default: 0
    },
    engagement_score: {
      type: Number,
      default: 0
    }
  },

  // Activity expiration
  expires_at: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },

  // Activity location/context
  location: {
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
    }
  },

  // Activity attachments
  attachments: [{
    filename: String,
    original_name: String,
    file_size: Number,
    file_type: String,
    file_url: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],

  // Activity reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true,
      enum: ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🔥']
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],

  // Activity mentions
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mentioned_at: {
      type: Date,
      default: Date.now
    },
    notified: {
      type: Boolean,
      default: false
    }
  }],

  // Activity system metadata
  system_metadata: {
    ip_address: String,
    user_agent: String,
    device_type: String,
    browser: String,
    source: String
  }
}, {
  timestamps: true
});

// Indexes for performance
activitySchema.index({ brand_id: 1, type: 1 });
activitySchema.index({ brand_id: 1, created_by: 1 });
activitySchema.index({ brand_id: 1, 'recipients.user': 1 });
activitySchema.index({ brand_id: 1, status: 1 });
activitySchema.index({ brand_id: 1, priority: 1 });
activitySchema.index({ brand_id: 1, visibility: 1 });
activitySchema.index({ brand_id: 1, created_at: -1 });
activitySchema.index({ brand_id: 1, 'metadata.entity_type': 1, 'metadata.entity_id': 1 });

// Virtual for recipient count
activitySchema.virtual('recipient_count').get(function() {
  return this.recipients.length;
});

// Virtual for reaction count
activitySchema.virtual('reaction_count').get(function() {
  return this.reactions.length;
});

// Virtual for mention count
activitySchema.virtual('mention_count').get(function() {
  return this.mentions.length;
});

// Pre-save middleware to update analytics
activitySchema.pre('save', function(next) {
  if (this.isModified('reactions')) {
    this.analytics.reaction_count = this.reactions.length;
  }
  if (this.isModified('mentions')) {
    this.analytics.mention_count = this.mentions.length;
  }
  next();
});

// Static method to get user activity feed
activitySchema.statics.getUserActivityFeed = function(userId, brandId, options = {}) {
  const query = {
    brand_id: brandId,
    $or: [
      { created_by: userId },
      { 'recipients.user': userId }
    ],
    status: 'active'
  };

  if (options.type) {
    query.type = options.type;
  }

  if (options.priority) {
    query.priority = options.priority;
  }

  if (options.visibility) {
    query.visibility = options.visibility;
  }

  return this.find(query)
    .populate('created_by', 'name email avatar')
    .populate('recipients.user', 'name email avatar')
    .populate('mentions.user', 'name email avatar')
    .sort({ created_at: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get entity activities
activitySchema.statics.getEntityActivities = function(entityType, entityId, brandId, options = {}) {
  const query = {
    'metadata.entity_type': entityType,
    'metadata.entity_id': entityId,
    brand_id: brandId,
    status: 'active'
  };

  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .populate('created_by', 'name email avatar')
    .populate('recipients.user', 'name email avatar')
    .sort({ created_at: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to search activities
activitySchema.statics.searchActivities = function(brandId, searchQuery, options = {}) {
  const query = {
    brand_id: brandId,
    status: 'active',
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { tags: { $in: [new RegExp(searchQuery, 'i')] } }
    ]
  };

  if (options.type) {
    query.type = options.type;
  }

  if (options.priority) {
    query.priority = options.priority;
  }

  return this.find(query)
    .populate('created_by', 'name email avatar')
    .populate('recipients.user', 'name email avatar')
    .sort({ created_at: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get activity analytics
activitySchema.statics.getActivityAnalytics = function(brandId, options = {}) {
  const matchStage = {
    brand_id: new mongoose.Types.ObjectId(brandId),
    status: 'active'
  };

  if (options.type) {
    matchStage.type = options.type;
  }

  if (options.date_from) {
    matchStage.created_at = { $gte: new Date(options.date_from) };
  }

  if (options.date_to) {
    matchStage.created_at = { ...matchStage.created_at, $lte: new Date(options.date_to) };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total_activities: { $sum: 1 },
        total_reactions: { $sum: { $size: '$reactions' } },
        total_mentions: { $sum: { $size: '$mentions' } },
        total_recipients: { $sum: { $size: '$recipients' } },
        avg_reactions_per_activity: { $avg: { $size: '$reactions' } },
        avg_mentions_per_activity: { $avg: { $size: '$mentions' } },
        activities_by_type: {
          $push: {
            type: '$type',
            priority: '$priority',
            visibility: '$visibility'
          }
        }
      }
    }
  ]);
};

// Static method to get user activity statistics
activitySchema.statics.getUserActivityStats = function(userId, brandId) {
  return this.aggregate([
    {
      $match: {
        created_by: new mongoose.Types.ObjectId(userId),
        brand_id: new mongoose.Types.ObjectId(brandId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        total_activities_created: { $sum: 1 },
        total_reactions_received: { $sum: { $size: '$reactions' } },
        total_mentions: { $sum: { $size: '$mentions' } },
        activities_by_type: {
          $push: '$type'
        }
      }
    }
  ]);
};

// Method to add recipient
activitySchema.methods.addRecipient = function(userId, role = 'secondary') {
  const existingRecipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (!existingRecipient) {
    this.recipients.push({
      user: userId,
      role: role,
      notification_sent: false,
      read: false,
      notified: false
    });
  }
  return this.save();
};

// Method to remove recipient
activitySchema.methods.removeRecipient = function(userId) {
  this.recipients = this.recipients.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to mark as read
activitySchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.read = true;
    recipient.read_at = new Date();
  }
  return this.save();
};

// Method to mark as notified
activitySchema.methods.markAsNotified = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.notified = true;
    recipient.notified_at = new Date();
  }
  return this.save();
};

// Method to add reaction
activitySchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    created_at: new Date()
  });
  
  return this.save();
};

// Method to remove reaction
activitySchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to add mention
activitySchema.methods.addMention = function(userId) {
  const existingMention = this.mentions.find(m => m.user.toString() === userId.toString());
  if (!existingMention) {
    this.mentions.push({
      user: userId,
      mentioned_at: new Date(),
      notified: false
    });
  }
  return this.save();
};

// Method to archive activity
activitySchema.methods.archiveActivity = function() {
  this.status = 'archived';
  return this.save();
};

// Method to restore activity
activitySchema.methods.restoreActivity = function() {
  this.status = 'active';
  return this.save();
};

module.exports = mongoose.model('Activity', activitySchema);