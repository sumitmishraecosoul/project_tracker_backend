const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand ID is required']
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  is_default: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries
categorySchema.index({ project_id: 1, order: 1 });
categorySchema.index({ brand_id: 1 });
categorySchema.index({ project_id: 1, name: 1 });

// Pre-save middleware to set order if not provided
categorySchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    // Find the highest order number in the project
    const highestOrderCategory = await this.constructor.findOne({
      project_id: this.project_id
    }).sort('-order');
    
    if (highestOrderCategory) {
      this.order = highestOrderCategory.order + 1;
    }
  }
  next();
});

// Instance method to get task count
categorySchema.methods.getTaskCount = async function() {
  const Task = mongoose.model('Task');
  return await Task.countDocuments({ category_id: this._id });
};

// Instance method to get tasks
categorySchema.methods.getTasks = async function() {
  const Task = mongoose.model('Task');
  return await Task.find({ category_id: this._id })
    .populate('assignedTo', 'name email')
    .populate('reporter', 'name email')
    .sort('order');
};

// Static method to create default categories for a project
categorySchema.statics.createDefaultCategories = async function(projectId, brandId, userId) {
  const defaultCategories = [
    { name: 'Operations', order: 0, color: '#3B82F6' },      // Blue
    { name: 'Ads', order: 1, color: '#10B981' },             // Green
    { name: 'Supply Chain', order: 2, color: '#F59E0B' },    // Orange
    { name: 'Design', order: 3, color: '#8B5CF6' },         // Purple
    { name: 'Misc', order: 4, color: '#6B7280' }            // Gray
  ];

  const categories = await this.insertMany(
    defaultCategories.map(cat => ({
      ...cat,
      project_id: projectId,
      brand_id: brandId,
      created_by: userId,
      is_default: true
    }))
  );

  return categories;
};

// Static method to reorder categories
categorySchema.statics.reorderCategories = async function(categoryOrders) {
  const bulkOps = categoryOrders.map(({ categoryId, order }) => ({
    updateOne: {
      filter: { _id: categoryId },
      update: { $set: { order } }
    }
  }));

  return await this.bulkWrite(bulkOps);
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

