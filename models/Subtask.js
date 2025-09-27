const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
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
  id: {
    type: String,
    unique: true,
    sparse: true
  },
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
  status: {
    type: String,
    enum: ['Yet to Start', 'In Progress', 'Completed', 'Blocked', 'On Hold', 'Cancelled', 'Recurring'],
    default: 'Yet to Start'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  order: {
    type: Number,
    default: 0
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remark: {
    type: String,
    trim: true,
    maxlength: 500
  },
  roadBlock: {
    type: String,
    trim: true,
    maxlength: 500
  },
  supportNeeded: {
    type: String,
    trim: true,
    maxlength: 500
  },
  labels: {
    type: [String],
    default: []
  },
  attachments: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentSubtask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtask'
  },
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubtaskTemplate'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
subtaskSchema.index({ brand_id: 1, task_id: 1 });
subtaskSchema.index({ brand_id: 1, assignedTo: 1 });
subtaskSchema.index({ brand_id: 1, status: 1 });
subtaskSchema.index({ brand_id: 1, priority: 1 });
subtaskSchema.index({ task_id: 1, order: 1 });
subtaskSchema.index({ brand_id: 1, is_completed: 1 });

// Virtual for task details
subtaskSchema.virtual('task', {
  ref: 'Task',
  localField: 'task_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignee details
subtaskSchema.virtual('assignee', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Virtual for reporter details
subtaskSchema.virtual('reporter_details', {
  ref: 'User',
  localField: 'reporter',
  foreignField: '_id',
  justOne: true
});

// Virtual for creator details
subtaskSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for parent subtask details
subtaskSchema.virtual('parent', {
  ref: 'Subtask',
  localField: 'parentSubtask',
  foreignField: '_id',
  justOne: true
});

// Virtual for child subtasks
subtaskSchema.virtual('children', {
  ref: 'Subtask',
  localField: '_id',
  foreignField: 'parentSubtask'
});

// Method to check if subtask is overdue
subtaskSchema.methods.isOverdue = function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'Completed';
};

// Method to check if subtask is completed
subtaskSchema.methods.isCompleted = function() {
  return this.status === 'Completed' || this.is_completed;
};

// Method to check if subtask is in progress
subtaskSchema.methods.isInProgress = function() {
  return this.status === 'In Progress';
};

// Method to check if subtask is blocked
subtaskSchema.methods.isBlocked = function() {
  return this.status === 'Blocked';
};

// Method to get completion percentage
subtaskSchema.methods.getCompletionPercentage = function() {
  if (this.isCompleted()) return 100;
  if (this.status === 'In Progress') return 50;
  if (this.status === 'To Do') return 0;
  return 0;
};

// Method to get time tracking
subtaskSchema.methods.getTimeTracking = function() {
  return {
    estimated: this.estimatedHours || 0,
    actual: this.actualHours || 0,
    remaining: Math.max(0, (this.estimatedHours || 0) - (this.actualHours || 0)),
    efficiency: this.actualHours > 0 ? ((this.estimatedHours || 0) / this.actualHours * 100).toFixed(2) : 0
  };
};

// Static method to get subtasks by task
subtaskSchema.statics.getSubtasksByTask = function(taskId, brandId) {
  return this.find({ 
    task_id: taskId, 
    brand_id: brandId 
  }).sort({ order: 1, createdAt: 1 });
};

// Static method to get subtask statistics
subtaskSchema.statics.getSubtaskStats = function(taskId, brandId) {
  return this.aggregate([
    { $match: { task_id: mongoose.Types.ObjectId(taskId), brand_id: mongoose.Types.ObjectId(brandId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgEstimatedHours: { $avg: '$estimatedHours' },
        avgActualHours: { $avg: '$actualHours' }
      }
    }
  ]);
};

// Pre-save middleware to generate unique subtask ID
subtaskSchema.pre('save', async function(next) {
  // Only generate ID for new documents that don't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the subtask with the highest ID number
      const lastSubtask = await this.constructor.findOne(
        { id: { $exists: true, $ne: null } },
        {},
        { sort: { id: -1 } }
      );

      let nextNumber = 1;
      
      if (lastSubtask && lastSubtask.id) {
        // Extract the number from the last subtask ID
        const match = lastSubtask.id.match(/SUBTASK-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Generate the new subtask ID
      this.id = `SUBTASK-${String(nextNumber).padStart(4, '0')}`;
      
    } catch (error) {
      console.error('Error generating subtask ID:', error);
      return next(new Error('Failed to generate subtask ID'));
    }
  }
  next();
});

// Pre-save middleware to set order if not provided
subtaskSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const lastSubtask = await this.constructor.findOne(
      { task_id: this.task_id, brand_id: this.brand_id },
      {},
      { sort: { order: -1 } }
    );
    this.order = lastSubtask ? lastSubtask.order + 1 : 1;
  }
  next();
});

// Pre-save middleware to handle completion
subtaskSchema.pre('save', function(next) {
  if (this.status === 'Completed' && !this.is_completed) {
    this.is_completed = true;
    this.completedAt = new Date();
    this.completedBy = this.assignedTo;
  } else if (this.status !== 'Completed' && this.is_completed) {
    this.is_completed = false;
    this.completedAt = undefined;
    this.completedBy = undefined;
  }
  next();
});

module.exports = mongoose.model('Subtask', subtaskSchema);
