const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  // Entity this comment belongs to (task, project, subtask)
  entity_type: {
    type: String,
    enum: ['task', 'project', 'subtask'],
    required: true
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // Comment content (Markdown formatted)
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  // Rendered HTML for display
  contentHtml: {
    type: String,
    trim: true
  },
  // Comment author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Parent comment for threading
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  // Array of reply IDs
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Reply count
  replyCount: {
    type: Number,
    default: 0
  },
  // Comment status
  status: {
    type: String,
    enum: ['active', 'edited', 'deleted', 'moderated'],
    default: 'active'
  },
  // Comment type
  type: {
    type: String,
    enum: ['comment', 'reply', 'mention', 'system', 'status_change', 'assignment'],
    default: 'comment'
  },
  // Mentions in the comment
  mentions: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    mentionedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Links shared in the comment
  links: [{
    url: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ['onedrive', 'googledrive', 'external', 'internal'],
      default: 'external'
    },
    preview: {
      image: String,
      domain: String
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
    mime_type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  // Comment reactions
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
  // Comment visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'team', 'mentioned'],
    default: 'public'
  },
  // Comment permissions
  permissions: {
    can_edit: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    can_delete: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    can_react: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  // Comment metadata
  metadata: {
    is_edited: {
      type: Boolean,
      default: false
    },
    edit_count: {
      type: Number,
      default: 0
    },
    last_edited_at: {
      type: Date
    },
    is_pinned: {
      type: Boolean,
      default: false
    },
    pinned_at: {
      type: Date
    },
    pinned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Editing support
  editedAt: {
    type: Date
  },
  // Edit history
  editHistory: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  // Deletion support
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Comment analytics
  analytics: {
    view_count: {
      type: Number,
      default: 0
    },
    reaction_count: {
      type: Number,
      default: 0
    },
    reply_count: {
      type: Number,
      default: 0
    },
    mention_count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
commentSchema.index({ brand_id: 1, entity_type: 1, entity_id: 1 });
commentSchema.index({ brand_id: 1, author: 1 });
commentSchema.index({ brand_id: 1, parent_comment: 1 });
commentSchema.index({ brand_id: 1, status: 1 });
commentSchema.index({ brand_id: 1, type: 1 });
commentSchema.index({ brand_id: 1, created_at: -1 });
commentSchema.index({ brand_id: 1, 'mentions.user_id': 1 });
commentSchema.index({ brand_id: 1, 'reactions.user_id': 1 });

// Virtual for author details
commentSchema.virtual('author_details', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

// Virtual for parent comment details
commentSchema.virtual('parent', {
  ref: 'Comment',
  localField: 'parent_comment',
  foreignField: '_id',
  justOne: true
});

// Virtual for child comments (replies)
commentSchema.virtual('childComments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId'
});

// Virtual for entity details
commentSchema.virtual('entity', {
  ref: function() {
    switch (this.entity_type) {
      case 'task': return 'Task';
      case 'project': return 'Project';
      case 'subtask': return 'Subtask';
      default: return null;
    }
  },
  localField: 'entity_id',
  foreignField: '_id',
  justOne: true
});

// Method to check if user can edit comment
commentSchema.methods.canUserEdit = function(userId, userRole) {
  // Author can always edit
  if (this.author.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user is in edit permissions
  const canEdit = this.permissions.can_edit.some(id => id.toString() === userId.toString());
  if (canEdit) {
    return true;
  }
  
  // Admin and managers can edit
  if (['admin', 'manager'].includes(userRole)) {
    return true;
  }
  
  return false;
};

// Method to check if user can delete comment
commentSchema.methods.canUserDelete = function(userId, userRole) {
  // Author can always delete
  if (this.author.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user is in delete permissions
  const canDelete = this.permissions.can_delete.some(id => id.toString() === userId.toString());
  if (canDelete) {
    return true;
  }
  
  // Admin and managers can delete
  if (['admin', 'manager'].includes(userRole)) {
    return true;
  }
  
  return false;
};

// Method to check if user can react to comment
commentSchema.methods.canUserReact = function(userId) {
  // Check if user is in react permissions
  const canReact = this.permissions.can_react.some(id => id.toString() === userId.toString());
  if (canReact) {
    return true;
  }
  
  // Default: all users can react
  return true;
};

// Method to add reaction
commentSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user_id.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user_id: userId,
    emoji: emoji
  });
  
  // Update analytics
  this.analytics.reaction_count = this.reactions.length;
  
  return this.save();
};

// Method to remove reaction
commentSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user_id.toString() !== userId.toString());
  this.analytics.reaction_count = this.reactions.length;
  return this.save();
};

// Method to add mention
commentSchema.methods.addMention = function(userId, position, length) {
  this.mentions.push({
    user_id: userId,
    position: position,
    length: length
  });
  this.analytics.mention_count = this.mentions.length;
  return this.save();
};

// Method to get comment thread
commentSchema.methods.getThread = async function() {
  const Comment = mongoose.model('Comment');
  return await Comment.find({
    $or: [
      { _id: this._id },
      { parent_comment: this._id }
    ],
    brand_id: this.brand_id
  }).populate('author', 'name email avatar')
    .populate('mentions.user_id', 'name email')
    .populate('reactions.user_id', 'name email')
    .sort({ createdAt: 1 });
};

// Method to get comment statistics
commentSchema.methods.getStatistics = function() {
  return {
    total_reactions: this.analytics.reaction_count,
    total_replies: this.analytics.reply_count,
    total_mentions: this.analytics.mention_count,
    total_views: this.analytics.view_count,
    is_edited: this.metadata.is_edited,
    edit_count: this.metadata.edit_count,
    is_pinned: this.metadata.is_pinned
  };
};

// Static method to get comments by entity
commentSchema.statics.getCommentsByEntity = function(brandId, entityType, entityId, options = {}) {
  const query = {
    brand_id: brandId,
    entity_type: entityType,
    entity_id: entityId,
    status: { $ne: 'deleted' }
  };
  
  if (options.parent_comment === null) {
    query.parent_comment = null;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.author) {
    query.author = options.author;
  }
  
  return this.find(query)
    .populate('author', 'name email avatar')
    .populate('mentions.user_id', 'name email')
    .populate('reactions.user_id', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get comment analytics
commentSchema.statics.getCommentAnalytics = function(brandId, entityType, entityId) {
  return this.aggregate([
    { $match: { brand_id: mongoose.Types.ObjectId(brandId), entity_type: entityType, entity_id: mongoose.Types.ObjectId(entityId) } },
    {
      $group: {
        _id: null,
        total_comments: { $sum: 1 },
        total_reactions: { $sum: '$analytics.reaction_count' },
        total_mentions: { $sum: '$analytics.mention_count' },
        total_views: { $sum: '$analytics.view_count' },
        avg_reactions_per_comment: { $avg: '$analytics.reaction_count' }
      }
    }
  ]);
};

// Pre-save middleware to update analytics
commentSchema.pre('save', function(next) {
  if (this.isModified('reactions')) {
    this.analytics.reaction_count = this.reactions.length;
  }
  
  if (this.isModified('mentions')) {
    this.analytics.mention_count = this.mentions.length;
  }
  
  if (this.isModified('content') && !this.isNew) {
    this.metadata.is_edited = true;
    this.metadata.edit_count += 1;
    this.metadata.last_edited_at = new Date();
    
    // Add to history
    this.history.push({
      content: this.content,
      edited_by: this.author,
      edited_at: new Date()
    });
  }
  
  next();
});

// Post-save middleware to update parent comment reply count
commentSchema.post('save', async function() {
  if (this.parent_comment) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(this.parent_comment, {
      $inc: { 'analytics.reply_count': 1 }
    });
  }
});

// Post-remove middleware to update parent comment reply count
commentSchema.post('remove', async function() {
  if (this.parent_comment) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(this.parent_comment, {
      $inc: { 'analytics.reply_count': -1 }
    });
  }
});

module.exports = mongoose.model('Comment', commentSchema);