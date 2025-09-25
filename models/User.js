const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  // New fields for enhanced user management
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  first_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      in_app: {
        type: Boolean,
        default: true
      },
      task_assigned: {
        type: Boolean,
        default: true
      },
      task_completed: {
        type: Boolean,
        default: true
      },
      comment_added: {
        type: Boolean,
        default: true
      },
      project_updated: {
        type: Boolean,
        default: true
      }
    },
    dashboard_layout: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  security: {
    password_hash: {
      type: String,
      default: ''
    },
    two_factor_enabled: {
      type: Boolean,
      default: false
    },
    two_factor_secret: {
      type: String,
      default: null
    },
    last_login: {
      type: Date,
      default: null
    },
    login_attempts: {
      type: Number,
      default: 0
    },
    locked_until: {
      type: Date,
      default: null
    }
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
      'Digital Marketing',
      'Thrive'
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

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'security.last_login': 1 });

// Virtuals for alternate field names
userSchema.virtual('fullName')
  .get(function() { return this.name; })
  .set(function(v) { this.name = v; });

userSchema.virtual('workEmail')
  .get(function() { return this.email; })
  .set(function(v) { this.email = v; });

// Virtual for user's brands
userSchema.virtual('brands', {
  ref: 'UserBrand',
  localField: '_id',
  foreignField: 'user_id'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Check if password is already hashed (starts with $2a$)
  if (this.password.startsWith('$2a$')) {
    console.log('Password already hashed, skipping...');
    return next();
  }
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    this.security.password_hash = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.security.locked_until && this.security.locked_until > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.locked_until && this.security.locked_until < Date.now()) {
    return this.updateOne({
      $unset: { 'security.locked_until': 1 },
      $set: { 'security.login_attempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.login_attempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { 'security.locked_until': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'security.login_attempts': 1, 'security.locked_until': 1 }
  });
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.security.last_login = new Date();
  return this.save();
};

// Method to check if user is active
userSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  });
};

// Static method to get user with brands
userSchema.statics.getUserWithBrands = function(userId) {
  return this.findById(userId)
    .populate({
      path: 'brands',
      populate: {
        path: 'brand_id',
        select: 'name slug status subscription'
      }
    });
};

module.exports = mongoose.model('User', userSchema);
