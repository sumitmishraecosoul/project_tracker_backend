const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true
    },
    id: {
      type: String,
      unique: true,
      sparse: true // Allow multiple null values but ensure uniqueness for non-null values
    },
    projectId: {
      type: String,
      required: true
    },
    task: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    taskType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Adhoc'],
      default: 'Daily'
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Yet to Start', 'In Progress', 'Completed', 'Blocked', 'On Hold', 'Cancelled', 'Recurring'],
      default: 'Yet to Start'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      validate: {
        validator: function(value) {
          // If status is 'Recurring', startDate should not be set
          if (this.status === 'Recurring' && value) {
            return false;
          }
          return true;
        },
        message: 'Start date cannot be set for recurring tasks'
      }
    },
    eta: {
      type: Date,
      required: function() {
        // ETA is not required for recurring tasks
        return this.status !== 'Recurring';
      },
      validate: {
        validator: function(value) {
          // If status is 'Recurring', eta should not be set
          if (this.status === 'Recurring' && value) {
            return false;
          }
          return true;
        },
        message: 'ETA cannot be set for recurring tasks'
      }
    },
    estimatedHours: {
      type: Number
    },
    actualHours: {
      type: Number
    },
    remark: {
      type: String,
      trim: true
    },
    roadBlock: {
      type: String,
      trim: true
    },
    supportNeeded: {
      type: String,
      trim: true
    },
    labels: {
      type: [String],
      default: []
    },
    attachments: {
      type: [String],
      default: []
    },
    relatedTasks: {
      type: [String],
      default: []
    },
    parentTask: {
      type: String
    },
    sprint: {
      type: String
    },
    section_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskSection'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
taskSchema.index({ brand_id: 1 });
taskSchema.index({ brand_id: 1, projectId: 1 });
taskSchema.index({ brand_id: 1, assignedTo: 1 });
taskSchema.index({ brand_id: 1, status: 1 });
taskSchema.index({ brand_id: 1, priority: 1 });
taskSchema.index({ brand_id: 1, eta: 1 });
taskSchema.index({ brand_id: 1, section_id: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ section_id: 1 });

// Virtual for brand details
taskSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brand_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for project details
taskSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignee details
taskSchema.virtual('assignee', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Virtual for reporter details
taskSchema.virtual('reporter_details', {
  ref: 'User',
  localField: 'reporter',
  foreignField: '_id',
  justOne: true
});

// Method to check if task is overdue
taskSchema.methods.isOverdue = function() {
  return this.eta && this.eta < new Date() && this.status !== 'Completed';
};

// Method to check if task is completed
taskSchema.methods.isCompleted = function() {
  return this.status === 'Completed';
};

// Method to check if task is in progress
taskSchema.methods.isInProgress = function() {
  return this.status === 'In Progress';
};

// Method to check if task is blocked
taskSchema.methods.isBlocked = function() {
  return this.status === 'Blocked';
};

// Static method to get tasks by brand
taskSchema.statics.getTasksByBrand = function(brandId, options = {}) {
  const query = { brand_id: brandId };
  
  if (options.projectId) {
    query.projectId = options.projectId;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.assignedTo) {
    query.assignedTo = options.assignedTo;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  return this.find(query)
    .populate('assignedTo', 'name email avatarUrl')
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get task statistics by brand
taskSchema.statics.getTaskStats = function(brandId) {
  return this.aggregate([
    { $match: { brand_id: mongoose.Types.ObjectId(brandId) } },
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

// Pre-save middleware to generate unique task ID - TEMPORARILY DISABLED
// taskSchema.pre('save', async function(next) {
//   console.log('Pre-save hook - isNew:', this.isNew, 'id:', this.id, 'id type:', typeof this.id);
//   
//   // Only generate ID for new documents that don't have an ID
//   if (this.isNew && (!this.id || this.id === '' || this.id === null || this.id === undefined)) {
//     try {
//       // Find the task with the highest ID number
//       const lastTask = await this.constructor.findOne(
//         { id: { $exists: true, $ne: null } },
//         {},
//         { sort: { id: -1 } }
//       );

//       let nextNumber = 1;
      
//       if (lastTask && lastTask.id) {
//         // Extract the number from the last task ID
//         const match = lastTask.id.match(/TASK-(\d+)/);
//         if (match) {
//           nextNumber = parseInt(match[1]) + 1;
//         }
//       }

//       // Generate the new task ID
//       this.id = `TASK-${String(nextNumber).padStart(4, '0')}`;
      
//       console.log(`Generated task ID: ${this.id}`);
      
//     } catch (error) {
//       console.error('Error generating task ID:', error);
//       return next(new Error('Failed to generate task ID'));
//     }
//   }
//   next();
// });

// Post-save middleware to handle duplicate key errors
taskSchema.post('save', function(error, doc, next) {
  if (error && error.name === 'MongoError' && error.code === 11000) {
    // Check if it's a duplicate key error for the id field
    if (error.keyPattern && error.keyPattern.id) {
      console.log('Duplicate task ID detected, regenerating...');
      
      // Clear the ID and save again to trigger regeneration
      doc.id = undefined;
      doc.save()
        .then(() => {
          console.log('Task saved successfully after ID regeneration');
          next();
        })
        .catch((saveError) => {
          console.error('Error saving after ID regeneration:', saveError);
          next(saveError);
        });
      return;
    }
  }
  next(error);
});

module.exports = mongoose.model('Task', taskSchema);
