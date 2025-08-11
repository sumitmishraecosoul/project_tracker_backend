const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
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
      enum: ['Feature', 'Bug', 'Enhancement', 'Documentation', 'Research'],
      default: 'Feature'
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed', 'Blocked', 'On Hold'],
      default: 'To Do'
    },
    assignedTo: {
      type: String,
      required: true
    },
    reporter: {
      type: String,
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

module.exports = mongoose.model('Task', taskSchema);
