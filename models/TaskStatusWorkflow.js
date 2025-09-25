const mongoose = require('mongoose');

const taskStatusWorkflowSchema = new mongoose.Schema({
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
  statuses: [{
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
      default: 'circle'
    },
    order: {
      type: Number,
      required: true
    },
    is_initial: {
      type: Boolean,
      default: false
    },
    is_final: {
      type: Boolean,
      default: false
    },
    is_completed: {
      type: Boolean,
      default: false
    },
    transitions: [{
      to_status: {
        type: String,
        required: true
      },
      condition: {
        type: String,
        enum: ['always', 'manual', 'automatic'],
        default: 'manual'
      },
      required_fields: [{
        type: String
      }],
      validation_rules: {
        type: mongoose.Schema.Types.Mixed
      }
    }]
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    allow_skip_status: {
      type: Boolean,
      default: false
    },
    require_comment_on_status_change: {
      type: Boolean,
      default: false
    },
    auto_assign_on_status_change: {
      type: Boolean,
      default: false
    },
    notify_on_status_change: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
taskStatusWorkflowSchema.index({ brand_id: 1, is_default: 1 });
taskStatusWorkflowSchema.index({ brand_id: 1, is_active: 1 });
taskStatusWorkflowSchema.index({ brand_id: 1, created_by: 1 });

// Virtual for creator details
taskStatusWorkflowSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Method to get initial status
taskStatusWorkflowSchema.methods.getInitialStatus = function() {
  return this.statuses.find(status => status.is_initial);
};

// Method to get final statuses
taskStatusWorkflowSchema.methods.getFinalStatuses = function() {
  return this.statuses.filter(status => status.is_final);
};

// Method to get completed statuses
taskStatusWorkflowSchema.methods.getCompletedStatuses = function() {
  return this.statuses.filter(status => status.is_completed);
};

// Method to get next possible statuses
taskStatusWorkflowSchema.methods.getNextStatuses = function(currentStatus) {
  const status = this.statuses.find(s => s.name === currentStatus);
  if (!status) return [];
  
  return status.transitions.map(transition => {
    const nextStatus = this.statuses.find(s => s.name === transition.to_status);
    return {
      name: nextStatus.name,
      display_name: nextStatus.display_name,
      color: nextStatus.color,
      icon: nextStatus.icon,
      condition: transition.condition,
      required_fields: transition.required_fields
    };
  });
};

// Method to check if status transition is valid
taskStatusWorkflowSchema.methods.isValidTransition = function(fromStatus, toStatus) {
  const status = this.statuses.find(s => s.name === fromStatus);
  if (!status) return false;
  
  return status.transitions.some(transition => transition.to_status === toStatus);
};

// Method to get status by name
taskStatusWorkflowSchema.methods.getStatusByName = function(statusName) {
  return this.statuses.find(status => status.name === statusName);
};

// Static method to get default workflow for brand
taskStatusWorkflowSchema.statics.getDefaultWorkflow = function(brandId) {
  return this.findOne({ 
    brand_id: brandId, 
    is_default: true, 
    is_active: true 
  });
};

// Static method to get all workflows for brand
taskStatusWorkflowSchema.statics.getWorkflowsForBrand = function(brandId) {
  return this.find({ 
    brand_id: brandId, 
    is_active: true 
  }).sort({ is_default: -1, createdAt: -1 });
};

// Pre-save middleware to ensure only one default workflow per brand
taskStatusWorkflowSchema.pre('save', async function(next) {
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

// Pre-save middleware to validate statuses
taskStatusWorkflowSchema.pre('save', function(next) {
  // Ensure at least one initial status
  const initialStatuses = this.statuses.filter(status => status.is_initial);
  if (initialStatuses.length === 0) {
    return next(new Error('At least one status must be marked as initial'));
  }
  
  // Ensure at least one final status
  const finalStatuses = this.statuses.filter(status => status.is_final);
  if (finalStatuses.length === 0) {
    return next(new Error('At least one status must be marked as final'));
  }
  
  // Ensure unique status names
  const statusNames = this.statuses.map(status => status.name);
  const uniqueNames = [...new Set(statusNames)];
  if (statusNames.length !== uniqueNames.length) {
    return next(new Error('Status names must be unique'));
  }
  
  next();
});

module.exports = mongoose.model('TaskStatusWorkflow', taskStatusWorkflowSchema);
