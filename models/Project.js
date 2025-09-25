const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    enum: [
      'Supply Chain-Operations',
      'Human Resources and Administration',
      'New Product Design',
      'India E-commerce',
      'Supply Chain',
      'Data Analytics',
      'E-commerce',
      'Retail E-commerce',
      'Finance & Accounts',
      'Zonal Sales (India)- HORECA',
      'Zonal Sales (India)',
      'Supply Chain & Operation',
      'Zonal Sales',
      'Digital Marketing',
      'Thrive'
    ],
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      default: 'member'
    }
  }],
  attachments: [{
    filename: String,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
projectSchema.index({ brand_id: 1 });
projectSchema.index({ brand_id: 1, status: 1 });
projectSchema.index({ brand_id: 1, createdBy: 1 });
projectSchema.index({ brand_id: 1, department: 1 });
projectSchema.index({ createdBy: 1 });

// Virtual for brand details
projectSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brand_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for task count
projectSchema.virtual('task_count', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  count: true
});

// Virtual for completed task count
projectSchema.virtual('completed_task_count', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  count: true,
  match: { status: 'Completed' }
});

// Method to calculate progress
projectSchema.methods.calculateProgress = function() {
  // This will be populated by aggregation pipeline
  return this.progress || 0;
};

// Method to check if project is active
projectSchema.methods.isActive = function() {
  return this.status === 'Active';
};

// Method to check if project is completed
projectSchema.methods.isCompleted = function() {
  return this.status === 'Completed';
};

// Static method to get projects by brand
projectSchema.statics.getProjectsByBrand = function(brandId, options = {}) {
  const query = { brand_id: brandId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.department) {
    query.department = options.department;
  }
  
  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get project statistics
projectSchema.statics.getProjectStats = function(brandId) {
  return this.aggregate([
    { $match: { brand_id: mongoose.Types.ObjectId(brandId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
};

module.exports = mongoose.model('Project', projectSchema);
