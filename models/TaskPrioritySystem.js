const mongoose = require('mongoose');

const taskPrioritySystemSchema = new mongoose.Schema({
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
  is_default: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  priorities: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    display_name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#3498db',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    icon: {
      type: String,
      default: 'flag'
    },
    order: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    is_default: {
      type: Boolean,
      default: false
    },
    auto_escalation: {
      enabled: {
        type: Boolean,
        default: false
      },
      days: {
        type: Number,
        default: 7
      },
      escalate_to: {
        type: String
      }
    },
    notification_settings: {
      notify_assignee: {
        type: Boolean,
        default: true
      },
      notify_reporter: {
        type: Boolean,
        default: true
      },
      notify_team: {
        type: Boolean,
        default: false
      }
    }
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    auto_assign_priority: {
      type: Boolean,
      default: false
    },
    default_priority: {
      type: String
    },
    allow_priority_change: {
      type: Boolean,
      default: true
    },
    require_justification_for_priority_change: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
taskPrioritySystemSchema.index({ brand_id: 1, is_default: 1 });
taskPrioritySystemSchema.index({ brand_id: 1, is_active: 1 });
taskPrioritySystemSchema.index({ brand_id: 1, created_by: 1 });

// Virtual for creator details
taskPrioritySystemSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Method to get default priority
taskPrioritySystemSchema.methods.getDefaultPriority = function() {
  return this.priorities.find(priority => priority.is_default) || this.priorities[0];
};

// Method to get priority by name
taskPrioritySystemSchema.methods.getPriorityByName = function(priorityName) {
  return this.priorities.find(priority => priority.name === priorityName);
};

// Method to get priority by weight
taskPrioritySystemSchema.methods.getPriorityByWeight = function(weight) {
  return this.priorities.find(priority => priority.weight === weight);
};

// Method to get higher priority
taskPrioritySystemSchema.methods.getHigherPriority = function(currentPriority) {
  const current = this.getPriorityByName(currentPriority);
  if (!current) return null;
  
  return this.priorities
    .filter(p => p.weight > current.weight)
    .sort((a, b) => a.weight - b.weight)[0];
};

// Method to get lower priority
taskPrioritySystemSchema.methods.getLowerPriority = function(currentPriority) {
  const current = this.getPriorityByName(currentPriority);
  if (!current) return null;
  
  return this.priorities
    .filter(p => p.weight < current.weight)
    .sort((a, b) => b.weight - a.weight)[0];
};

// Method to get all priorities sorted by weight
taskPrioritySystemSchema.methods.getPrioritiesSorted = function() {
  return this.priorities.sort((a, b) => b.weight - a.weight);
};

// Method to check if priority change is allowed
taskPrioritySystemSchema.methods.canChangePriority = function(fromPriority, toPriority) {
  if (!this.settings.allow_priority_change) return false;
  
  const from = this.getPriorityByName(fromPriority);
  const to = this.getPriorityByName(toPriority);
  
  if (!from || !to) return false;
  
  return true;
};

// Static method to get default priority system for brand
taskPrioritySystemSchema.statics.getDefaultPrioritySystem = function(brandId) {
  return this.findOne({ 
    brand_id: brandId, 
    is_default: true, 
    is_active: true 
  });
};

// Static method to get all priority systems for brand
taskPrioritySystemSchema.statics.getPrioritySystemsForBrand = function(brandId) {
  return this.find({ 
    brand_id: brandId, 
    is_active: true 
  }).sort({ is_default: -1, createdAt: -1 });
};

// Pre-save middleware to ensure only one default priority system per brand
taskPrioritySystemSchema.pre('save', async function(next) {
  if (this.is_default) {
    await this.constructor.updateMany(
      { 
        brand_id: this.brand_id, 
        _id: { $ne: this._id } 
      },
      { is_default: false }
    );
  }
  next();
});

// Pre-save middleware to validate priorities
taskPrioritySystemSchema.pre('save', function(next) {
  // Ensure at least one priority
  if (this.priorities.length === 0) {
    return next(new Error('At least one priority must be defined'));
  }
  
  // Ensure unique priority names
  const priorityNames = this.priorities.map(priority => priority.name);
  const uniqueNames = [...new Set(priorityNames)];
  if (priorityNames.length !== uniqueNames.length) {
    return next(new Error('Priority names must be unique'));
  }
  
  // Ensure unique weights
  const weights = this.priorities.map(priority => priority.weight);
  const uniqueWeights = [...new Set(weights)];
  if (weights.length !== uniqueWeights.length) {
    return next(new Error('Priority weights must be unique'));
  }
  
  // Ensure exactly one default priority
  const defaultPriorities = this.priorities.filter(priority => priority.is_default);
  if (defaultPriorities.length !== 1) {
    return next(new Error('Exactly one priority must be marked as default'));
  }
  
  next();
});

module.exports = mongoose.model('TaskPrioritySystem', taskPrioritySystemSchema);
