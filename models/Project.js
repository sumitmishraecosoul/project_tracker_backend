const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
      'Digital Marketing'
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
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
