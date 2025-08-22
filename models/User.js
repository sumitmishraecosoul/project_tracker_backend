const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  employeeNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
    default: 'India E-commerce'
  },
  jobTitle: {
    type: String,
    trim: true,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for alternate field names
userSchema.virtual('fullName')
  .get(function() { return this.name; })
  .set(function(v) { this.name = v; });

userSchema.virtual('workEmail')
  .get(function() { return this.email; })
  .set(function(v) { this.email = v; });

module.exports = mongoose.model('User', userSchema);
