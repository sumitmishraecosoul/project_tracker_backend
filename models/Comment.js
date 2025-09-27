const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Brand isolation
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    index: true
  },

  // Comment content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },

  // Comment author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Entity this comment belongs to (task, project, subtask, etc.)
  entity_type: {
    type: String,
    required: true,
    enum: ['task', 'project', 'subtask', 'user', 'brand'],
    index: true
  },

  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  // Comment threading
  parent_comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },

  // Comment status
  status: {
    type: String,
    enum: ['active', 'deleted', 'hidden', 'moderated'],
    default: 'active',
    index: true
  },

  // Comment moderation
  moderation_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved',
    index: true
  },

  // Comment permissions
  permissions: {
    can_edit: {
      type: Boolean,
      default: true
    },
    can_delete: {
      type: Boolean,
      default: true
    },
    can_react: {
      type: Boolean,
      default: true
    },
    can_reply: {
      type: Boolean,
      default: true
    }
  },

  // Comment reactions
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

  // Comment mentions
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

  // Comment attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    original_name: {
      type: String,
      required: true
    },
    file_size: {
      type: Number,
      required: true
    },
    file_type: {
      type: String,
      required: true
    },
    file_url: {
      type: String,
      required: true
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],

  // Comment pinning
  is_pinned: {
    type: Boolean,
    default: false,
    index: true
  },

  // Comment analytics
  analytics: {
    view_count: {
      type: Number,
      default: 0
    },
    reply_count: {
      type: Number,
      default: 0
    },
    reaction_count: {
      type: Number,
      default: 0
    },
    mention_count: {
      type: Number,
      default: 0
    }
  },

  // Comment history for editing
  history: [{
    content: String,
    edited_at: {
      type: Date,
      default: Date.now
    },
    edited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Comment metadata
  metadata: {
    ip_address: String,
    user_agent: String,
    device_type: String,
    browser: String
  }
}, {
  timestamps: true
});

// Indexes for performance
commentSchema.index({ brand_id: 1, entity_type: 1, entity_id: 1 });
commentSchema.index({ brand_id: 1, author: 1 });
commentSchema.index({ brand_id: 1, parent_comment: 1 });
commentSchema.index({ brand_id: 1, status: 1 });
commentSchema.index({ brand_id: 1, is_pinned: 1 });
commentSchema.index({ brand_id: 1, created_at: -1 });

// Virtual for reply count
commentSchema.virtual('reply_count').get(function() {
  return this.analytics.reply_count;
});

// Virtual for reaction count
commentSchema.virtual('reaction_count').get(function() {
  return this.analytics.reaction_count;
});

// Virtual for mention count
commentSchema.virtual('mention_count').get(function() {
  return this.analytics.mention_count;
});

// Pre-save middleware to update analytics
commentSchema.pre('save', function(next) {
  if (this.isModified('reactions')) {
    this.analytics.reaction_count = this.reactions.length;
  }
  if (this.isModified('mentions')) {
    this.analytics.mention_count = this.mentions.length;
  }
  next();
});

// Static method to get comment thread
commentSchema.statics.getCommentThread = function(commentId, brandId) {
  return this.find({
    $or: [
      { _id: commentId },
      { parent_comment: commentId }
    ],
    brand_id: brandId,
    status: 'active'
  })
  .populate('author', 'name email avatar')
  .populate('mentions.user', 'name email')
  .sort({ created_at: 1 });
};

// Static method to get entity comments
commentSchema.statics.getEntityComments = function(entityType, entityId, brandId, options = {}) {
  const query = {
    entity_type: entityType,
    entity_id: entityId,
    brand_id: brandId,
    status: 'active'
  };

  if (options.parent_comment === null) {
    query.parent_comment = null;
  }

  return this.find(query)
    .populate('author', 'name email avatar')
    .populate('mentions.user', 'name email')
    .sort({ is_pinned: -1, created_at: 1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to search comments
commentSchema.statics.searchComments = function(brandId, searchQuery, options = {}) {
  const query = {
    brand_id: brandId,
    status: 'active',
    $or: [
      { content: { $regex: searchQuery, $options: 'i' } },
      { 'author.name': { $regex: searchQuery, $options: 'i' } }
    ]
  };

  return this.find(query)
    .populate('author', 'name email avatar')
    .populate('mentions.user', 'name email')
    .sort({ created_at: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get comment analytics
commentSchema.statics.getCommentAnalytics = function(brandId, options = {}) {
  const matchStage = {
    brand_id: new mongoose.Types.ObjectId(brandId),
    status: 'active'
  };

  if (options.entity_type) {
    matchStage.entity_type = options.entity_type;
  }

  if (options.entity_id) {
    matchStage.entity_id = new mongoose.Types.ObjectId(options.entity_id);
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
        total_comments: { $sum: 1 },
        total_reactions: { $sum: { $size: '$reactions' } },
        total_mentions: { $sum: { $size: '$mentions' } },
        total_attachments: { $sum: { $size: '$attachments' } },
        avg_reactions_per_comment: { $avg: { $size: '$reactions' } },
        avg_mentions_per_comment: { $avg: { $size: '$mentions' } },
        comments_by_entity_type: {
          $push: {
            entity_type: '$entity_type',
            entity_id: '$entity_id'
          }
        }
      }
    }
  ]);
};

// Static method to get user comment statistics
commentSchema.statics.getUserCommentStats = function(userId, brandId) {
  return this.aggregate([
    {
      $match: {
        author: new mongoose.Types.ObjectId(userId),
        brand_id: new mongoose.Types.ObjectId(brandId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        total_comments: { $sum: 1 },
        total_reactions_received: { $sum: { $size: '$reactions' } },
        total_mentions: { $sum: { $size: '$mentions' } },
        total_attachments: { $sum: { $size: '$attachments' } },
        comments_by_entity_type: {
          $push: '$entity_type'
        }
      }
    }
  ]);
};

// Method to add reaction
commentSchema.methods.addReaction = function(userId, emoji) {
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
commentSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to add mention
commentSchema.methods.addMention = function(userId) {
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

// Method to pin comment
commentSchema.methods.pinComment = function() {
  this.is_pinned = true;
  return this.save();
};

// Method to unpin comment
commentSchema.methods.unpinComment = function() {
  this.is_pinned = false;
  return this.save();
};

// Method to moderate comment
commentSchema.methods.moderateComment = function(status, moderatorId) {
  this.moderation_status = status;
  if (status === 'rejected') {
    this.status = 'hidden';
  }
  return this.save();
};

// Method to edit comment
commentSchema.methods.editComment = function(newContent, editorId) {
  // Add to history
  this.history.push({
    content: this.content,
    edited_at: new Date(),
    edited_by: editorId
  });
  
  // Update content
  this.content = newContent;
  return this.save();
};

module.exports = mongoose.model('Comment', commentSchema);