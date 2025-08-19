const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
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
      enum: ['Yet to Start', 'In Progress', 'Completed', 'Blocked', 'On Hold', 'Cancelled'],
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
      type: Date
    },
    eta: {
      type: Date,
      required: true
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
    }
  },
  { timestamps: true }
);

// Pre-save middleware to generate unique task ID
taskSchema.pre('save', async function(next) {
  // Only generate ID for new documents that don't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the task with the highest ID number
      const lastTask = await this.constructor.findOne(
        { id: { $exists: true, $ne: null } },
        {},
        { sort: { id: -1 } }
      );

      let nextNumber = 1;
      
      if (lastTask && lastTask.id) {
        // Extract the number from the last task ID
        const match = lastTask.id.match(/TASK-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Generate the new task ID
      this.id = `TASK-${String(nextNumber).padStart(4, '0')}`;
      
      console.log(`Generated task ID: ${this.id}`);
      
    } catch (error) {
      console.error('Error generating task ID:', error);
      return next(new Error('Failed to generate task ID'));
    }
  }
  next();
});

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
