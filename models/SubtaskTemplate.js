const mongoose = require('mongoose');

const subtaskTemplateSchema = new mongoose.Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['Development', 'Testing', 'Design', 'Documentation', 'Review', 'Deployment', 'Maintenance', 'Other'],
    default: 'Other'
  },
  is_public: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium'
    },
    estimatedHours: {
      type: Number,
      min: 0
    },
    order: {
      type: Number,
      required: true
    },
    is_required: {
      type: Boolean,
      default: true
    },
    labels: {
      type: [String],
      default: []
    }
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usage_count: {
    type: Number,
    default: 0
  },
  last_used: {
    type: Date
  },
  settings: {
    auto_assign_priority: {
      type: Boolean,
      default: false
    },
    default_priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium'
    },
    auto_assign_estimated_hours: {
      type: Boolean,
      default: false
    },
    default_estimated_hours: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
subtaskTemplateSchema.index({ brand_id: 1, is_active: 1 });
subtaskTemplateSchema.index({ brand_id: 1, category: 1 });
subtaskTemplateSchema.index({ brand_id: 1, is_public: 1 });
subtaskTemplateSchema.index({ brand_id: 1, created_by: 1 });
subtaskTemplateSchema.index({ usage_count: -1 });

// Virtual for creator details
subtaskTemplateSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Virtual for subtask count
subtaskTemplateSchema.virtual('subtask_count', {
  ref: 'Subtask',
  localField: '_id',
  foreignField: 'template_id',
  count: true
});

// Method to get template statistics
subtaskTemplateSchema.methods.getStatistics = function() {
  return {
    total_subtasks: this.subtasks.length,
    required_subtasks: this.subtasks.filter(subtask => subtask.is_required).length,
    optional_subtasks: this.subtasks.filter(subtask => !subtask.is_required).length,
    total_estimated_hours: this.subtasks.reduce((sum, subtask) => sum + (subtask.estimatedHours || 0), 0),
    usage_count: this.usage_count,
    last_used: this.last_used
  };
};

// Method to check if template is active
subtaskTemplateSchema.methods.isActive = function() {
  return this.is_active;
};

// Method to check if template is public
subtaskTemplateSchema.methods.isPublic = function() {
  return this.is_public;
};

// Method to increment usage
subtaskTemplateSchema.methods.incrementUsage = function() {
  this.usage_count += 1;
  this.last_used = new Date();
  return this.save();
};

// Method to get subtasks by priority
subtaskTemplateSchema.methods.getSubtasksByPriority = function(priority) {
  return this.subtasks.filter(subtask => subtask.priority === priority);
};

// Method to get required subtasks
subtaskTemplateSchema.methods.getRequiredSubtasks = function() {
  return this.subtasks.filter(subtask => subtask.is_required);
};

// Method to get optional subtasks
subtaskTemplateSchema.methods.getOptionalSubtasks = function() {
  return this.subtasks.filter(subtask => !subtask.is_required);
};

// Static method to get templates by brand
subtaskTemplateSchema.statics.getTemplatesByBrand = function(brandId, options = {}) {
  const query = { brand_id: brandId, is_active: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.is_public !== undefined) {
    query.is_public = options.is_public;
  }
  
  return this.find(query).sort({ usage_count: -1, createdAt: -1 });
};

// Static method to get popular templates
subtaskTemplateSchema.statics.getPopularTemplates = function(brandId, limit = 10) {
  return this.find({ 
    brand_id: brandId, 
    is_active: true,
    usage_count: { $gt: 0 }
  }).sort({ usage_count: -1 }).limit(limit);
};

// Static method to get templates by category
subtaskTemplateSchema.statics.getTemplatesByCategory = function(brandId, category) {
  return this.find({ 
    brand_id: brandId, 
    category: category,
    is_active: true 
  }).sort({ usage_count: -1, createdAt: -1 });
};

// Pre-save middleware to validate subtasks
subtaskTemplateSchema.pre('save', function(next) {
  // Ensure at least one subtask
  if (this.subtasks.length === 0) {
    return next(new Error('Template must have at least one subtask'));
  }
  
  // Ensure unique order values
  const orders = this.subtasks.map(subtask => subtask.order);
  const uniqueOrders = [...new Set(orders)];
  if (orders.length !== uniqueOrders.length) {
    return next(new Error('Subtask orders must be unique'));
  }
  
  // Ensure unique titles within template
  const titles = this.subtasks.map(subtask => subtask.title);
  const uniqueTitles = [...new Set(titles)];
  if (titles.length !== uniqueTitles.length) {
    return next(new Error('Subtask titles must be unique within template'));
  }
  
  next();
});

module.exports = mongoose.model('SubtaskTemplate', subtaskTemplateSchema);
