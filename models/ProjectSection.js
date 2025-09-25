const mongoose = require('mongoose');

const projectSectionSchema = new mongoose.Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
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
  order: {
    type: Number,
    default: 0
  },
  is_visible: {
    type: Boolean,
    default: true
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
    default: 'folder'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    show_completed_tasks: {
      type: Boolean,
      default: true
    },
    task_limit: {
      type: Number,
      default: null
    },
    auto_archive_completed: {
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
projectSectionSchema.index({ brand_id: 1, project_id: 1 });
projectSectionSchema.index({ project_id: 1, order: 1 });
projectSectionSchema.index({ brand_id: 1, created_by: 1 });

// Virtual for task count
projectSectionSchema.virtual('task_count', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'section_id',
  count: true
});

// Virtual for completed task count
projectSectionSchema.virtual('completed_task_count', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'section_id',
  count: true,
  match: { status: 'Completed' }
});

// Virtual for project details
projectSectionSchema.virtual('project', {
  ref: 'Project',
  localField: 'project_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator details
projectSectionSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Method to get section statistics
projectSectionSchema.methods.getStatistics = function() {
  return {
    total_tasks: this.task_count || 0,
    completed_tasks: this.completed_task_count || 0,
    completion_rate: this.task_count > 0 ? ((this.completed_task_count || 0) / this.task_count * 100).toFixed(2) : 0
  };
};

// Method to check if section is active
projectSectionSchema.methods.isActive = function() {
  return this.is_visible;
};

// Static method to get sections by project
projectSectionSchema.statics.getSectionsByProject = function(projectId, brandId) {
  return this.find({ 
    project_id: projectId, 
    brand_id: brandId,
    is_visible: true 
  }).sort({ order: 1 });
};

// Static method to get section statistics
projectSectionSchema.statics.getSectionStatistics = function(sectionId, brandId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(sectionId), brand_id: mongoose.Types.ObjectId(brandId) } },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'section_id',
        as: 'tasks'
      }
    },
    {
      $project: {
        name: 1,
        total_tasks: { $size: '$tasks' },
        completed_tasks: {
          $size: {
            $filter: {
              input: '$tasks',
              cond: { $eq: ['$$this.status', 'Completed'] }
            }
          }
        }
      }
    }
  ]);
};

// Pre-save middleware to set order if not provided
projectSectionSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const lastSection = await this.constructor.findOne(
      { project_id: this.project_id, brand_id: this.brand_id },
      {},
      { sort: { order: -1 } }
    );
    this.order = lastSection ? lastSection.order + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('ProjectSection', projectSectionSchema);
