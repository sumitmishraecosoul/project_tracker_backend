const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  typeOfWork: {
    type: String,
    enum: ['Development', 'Testing', 'Meeting', 'Documentation', 'Research', 'Bug Fix', 'Feature', 'Other'],
    required: true
  },
  workDescription: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Adhoc'],
    default: 'Daily'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  hoursSpent: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
userTaskSchema.index({ user: 1, date: 1 });
userTaskSchema.index({ project: 1 });

module.exports = mongoose.model('UserTask', userTaskSchema);
