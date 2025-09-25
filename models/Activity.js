const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Brand isolation
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },
  // Entity this activity belongs to
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  // Activity type
  type: {
    type: String,
    enum: ['created', 'completed', 'commented', 'assigned', 'status_changed', 'priority_changed', 'due_date_changed', 'reopened', 'archived', 'deleted'],
    required: true,
    index: true
  },
  // Activity description
  description: {
    type: String,
    required: true,
    trim: true
  },
  // User who performed the activity
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    }
  },
  // Activity metadata
  metadata: {
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    // Additional context
    context: mongoose.Schema.Types.Mixed
  },
  // Activity reactions
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Activity visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'team'],
    default: 'public'
  },
  // Activity importance
  importance: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  // Activity tags
  tags: [{
    type: String,
    maxlength: 50
  }],
  // Activity analytics
  analytics: {
    view_count: {
      type: Number,
      default: 0
    },
    reaction_count: {
      type: Number,
      default: 0
    }
  },
  // Activity status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'activities'
});

// Indexes for performance
activitySchema.index({ brand_id: 1, taskId: 1, createdAt: -1 });
activitySchema.index({ brand_id: 1, projectId: 1, createdAt: -1 });
activitySchema.index({ brand_id: 1, 'user.userId': 1, createdAt: -1 });
activitySchema.index({ brand_id: 1, type: 1, createdAt: -1 });
activitySchema.index({ brand_id: 1, status: 1 });

// Virtual for user details
activitySchema.virtual('user_details', {
  ref: 'User',
  localField: 'user.userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for task details
activitySchema.virtual('task', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true
});

// Virtual for project details
activitySchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Method to add reaction
activitySchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    userId: userId,
    emoji: emoji
  });
  
  // Update analytics
  this.analytics.reaction_count = this.reactions.length;
  
  return this.save();
};

// Method to remove reaction
activitySchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
  this.analytics.reaction_count = this.reactions.length;
  return this.save();
};

// Method to get activity statistics
activitySchema.methods.getStatistics = function() {
  return {
    total_reactions: this.analytics.reaction_count,
    total_views: this.analytics.view_count,
    is_archived: this.status === 'archived',
    is_deleted: this.status === 'deleted'
  };
};

// Static method to get activities by task
activitySchema.statics.getActivitiesByTask = function(brandId, taskId, options = {}) {
  const query = {
    brand_id: brandId,
    taskId: taskId,
    status: 'active'
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.user) {
    query['user.userId'] = options.user;
  }
  
  return this.find(query)
    .populate('user.userId', 'name email avatar')
    .populate('reactions.userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0);
};

// Static method to get activities by project
activitySchema.statics.getActivitiesByProject = function(brandId, projectId, options = {}) {
  const query = {
    brand_id: brandId,
    projectId: projectId,
    status: 'active'
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.user) {
    query['user.userId'] = options.user;
  }
  
  return this.find(query)
    .populate('user.userId', 'name email avatar')
    .populate('reactions.userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0);
};

// Static method to get user activities
activitySchema.statics.getUserActivities = function(brandId, userId, options = {}) {
  const query = {
    brand_id: brandId,
    'user.userId': userId,
    status: 'active'
  };
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .populate('taskId', 'task title')
    .populate('projectId', 'title')
    .populate('reactions.userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.offset || 0);
};

// Static method to get activity analytics
activitySchema.statics.getActivityAnalytics = function(brandId, taskId) {
  return this.aggregate([
    { $match: { brand_id: mongoose.Types.ObjectId(brandId), taskId: mongoose.Types.ObjectId(taskId) } },
    {
      $group: {
        _id: null,
        total_activities: { $sum: 1 },
        total_reactions: { $sum: '$analytics.reaction_count' },
        total_views: { $sum: '$analytics.view_count' },
        activities_by_type: {
          $push: {
            type: '$type',
            reaction_count: '$analytics.reaction_count',
            view_count: '$analytics.view_count'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware to update analytics
activitySchema.pre('save', function(next) {
  if (this.isModified('reactions')) {
    this.analytics.reaction_count = this.reactions.length;
  }
  
  next();
});

module.exports = mongoose.model('Activity', activitySchema);