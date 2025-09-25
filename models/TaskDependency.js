const mongoose = require('mongoose');

const taskDependencySchema = new mongoose.Schema({
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  depends_on_task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  dependency_type: {
    type: String,
    enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
    default: 'finish_to_start'
  },
  lag_days: {
    type: Number,
    default: 0,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
taskDependencySchema.index({ brand_id: 1, task_id: 1 });
taskDependencySchema.index({ brand_id: 1, depends_on_task_id: 1 });
taskDependencySchema.index({ task_id: 1, depends_on_task_id: 1 });
taskDependencySchema.index({ brand_id: 1, is_active: 1 });

// Virtual for task details
taskDependencySchema.virtual('task', {
  ref: 'Task',
  localField: 'task_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for dependency task details
taskDependencySchema.virtual('depends_on_task', {
  ref: 'Task',
  localField: 'depends_on_task_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator details
taskDependencySchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true
});

// Method to check if dependency is valid
taskDependencySchema.methods.isValid = function() {
  return this.task_id.toString() !== this.depends_on_task_id.toString();
};

// Method to check if dependency creates a cycle
taskDependencySchema.methods.createsCycle = async function() {
  // This would need to be implemented with a recursive check
  // For now, we'll return false as a placeholder
  return false;
};

// Method to get dependency description
taskDependencySchema.methods.getDescription = function() {
  const descriptions = {
    'finish_to_start': 'Task must finish before dependent task starts',
    'start_to_start': 'Task must start before dependent task starts',
    'finish_to_finish': 'Task must finish before dependent task finishes',
    'start_to_finish': 'Task must start before dependent task finishes'
  };
  return descriptions[this.dependency_type] || 'Unknown dependency type';
};

// Static method to get dependencies for a task
taskDependencySchema.statics.getTaskDependencies = function(taskId, brandId) {
  return this.find({ 
    task_id: taskId, 
    brand_id: new mongoose.Types.ObjectId(brandId),
    is_active: true 
  }).populate('depends_on_task', 'id task status priority eta');
};

// Static method to get tasks that depend on a specific task
taskDependencySchema.statics.getDependentTasks = function(taskId, brandId) {
  return this.find({ 
    depends_on_task_id: taskId, 
    brand_id: new mongoose.Types.ObjectId(brandId),
    is_active: true 
  }).populate('task', 'id task status priority eta');
};

// Static method to check for circular dependencies
taskDependencySchema.statics.checkCircularDependency = async function(taskId, dependsOnTaskId, brandId) {
  // Simple check: if the dependency task already depends on the current task
  const existingDependency = await this.findOne({
    task_id: dependsOnTaskId,
    depends_on_task_id: taskId,
    brand_id: new mongoose.Types.ObjectId(brandId),
    is_active: true
  });
  
  return !!existingDependency;
};

// Pre-save middleware to validate dependency
taskDependencySchema.pre('save', async function(next) {
  // Check if task is trying to depend on itself
  if (this.task_id.toString() === this.depends_on_task_id.toString()) {
    return next(new Error('Task cannot depend on itself'));
  }
  
  // Check for circular dependency
  const hasCircularDependency = await this.constructor.checkCircularDependency(
    this.task_id, 
    this.depends_on_task_id, 
    this.brand_id
  );
  
  if (hasCircularDependency) {
    return next(new Error('Circular dependency detected'));
  }
  
  next();
});

module.exports = mongoose.model('TaskDependency', taskDependencySchema);
