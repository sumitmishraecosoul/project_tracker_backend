const mongoose = require('mongoose');

const projectViewSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['overview', 'list', 'board', 'timeline', 'dashboard', 'calendar', 'workload'],
    required: true
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
  is_public: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    // View-specific settings
    columns: [{
      field: String,
      visible: { type: Boolean, default: true },
      width: Number,
      order: Number
    }],
    filters: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],
    sorting: [{
      field: String,
      direction: { type: String, enum: ['asc', 'desc'], default: 'asc' }
    }],
    grouping: {
      field: String,
      enabled: { type: Boolean, default: false }
    },
    pagination: {
      enabled: { type: Boolean, default: true },
      page_size: { type: Number, default: 25 }
    }
  },
  permissions: {
    can_view: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    can_edit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    can_delete: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  layout: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
projectViewSchema.index({ brand_id: 1, project_id: 1 });
projectViewSchema.index({ project_id: 1, type: 1 });
projectViewSchema.index({ brand_id: 1, created_by: 1 });
projectViewSchema.index({ is_default: 1, project_id: 1 });

// Virtual for project details
projectViewSchema.virtual('project', {
  ref: 'Project',
  localField: 'project_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator details
projectViewSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Method to check if user can view
projectViewSchema.methods.canUserView = function(userId) {
  return this.is_public || 
         this.created_by.toString() === userId.toString() ||
         this.permissions.can_view.some(id => id.toString() === userId.toString());
};

// Method to check if user can edit
projectViewSchema.methods.canUserEdit = function(userId) {
  return this.created_by.toString() === userId.toString() ||
         this.permissions.can_edit.some(id => id.toString() === userId.toString());
};

// Method to check if user can delete
projectViewSchema.methods.canUserDelete = function(userId) {
  return this.created_by.toString() === userId.toString() ||
         this.permissions.can_delete.some(id => id.toString() === userId.toString());
};

// Method to apply filters to query
projectViewSchema.methods.applyFilters = function(baseQuery) {
  if (!this.settings.filters || this.settings.filters.length === 0) {
    return baseQuery;
  }

  const filterQuery = {};
  
  this.settings.filters.forEach(filter => {
    switch (filter.operator) {
      case 'equals':
        filterQuery[filter.field] = filter.value;
        break;
      case 'not_equals':
        filterQuery[filter.field] = { $ne: filter.value };
        break;
      case 'contains':
        filterQuery[filter.field] = { $regex: filter.value, $options: 'i' };
        break;
      case 'not_contains':
        filterQuery[filter.field] = { $not: { $regex: filter.value, $options: 'i' } };
        break;
      case 'greater_than':
        filterQuery[filter.field] = { $gt: filter.value };
        break;
      case 'less_than':
        filterQuery[filter.field] = { $lt: filter.value };
        break;
      case 'in':
        filterQuery[filter.field] = { $in: filter.value };
        break;
      case 'not_in':
        filterQuery[filter.field] = { $nin: filter.value };
        break;
    }
  });

  return { ...baseQuery, ...filterQuery };
};

// Method to apply sorting
projectViewSchema.methods.applySorting = function() {
  if (!this.settings.sorting || this.settings.sorting.length === 0) {
    return { createdAt: -1 };
  }

  const sortQuery = {};
  this.settings.sorting.forEach(sort => {
    sortQuery[sort.field] = sort.direction === 'asc' ? 1 : -1;
  });

  return sortQuery;
};

// Static method to get views by project
projectViewSchema.statics.getViewsByProject = function(projectId, brandId, userId) {
  return this.find({
    project_id: projectId,
    brand_id: brandId,
    $or: [
      { is_public: true },
      { created_by: userId },
      { 'permissions.can_view': userId }
    ]
  }).sort({ is_default: -1, createdAt: -1 });
};

// Static method to get default view
projectViewSchema.statics.getDefaultView = function(projectId, brandId, type) {
  return this.findOne({
    project_id: projectId,
    brand_id: brandId,
    type: type,
    is_default: true
  });
};

// Pre-save middleware to ensure only one default view per type per project
projectViewSchema.pre('save', async function(next) {
  if (this.is_default) {
    await this.constructor.updateMany(
      { 
        project_id: this.project_id, 
        brand_id: this.brand_id, 
        type: this.type,
        _id: { $ne: this._id } 
      },
      { is_default: false }
    );
  }
  next();
});

module.exports = mongoose.model('ProjectView', projectViewSchema);
