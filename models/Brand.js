const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  logo: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    date_format: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    working_hours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    holidays: [{
      name: String,
      date: Date,
      recurring: Boolean
    }],
    custom_fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'cancelled'],
      default: 'trial'
    },
    trial_ends_at: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
      }
    },
    billing_cycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    max_users: {
      type: Number,
      default: 5
    },
    max_projects: {
      type: Number,
      default: 10
    },
    features: [{
      type: String,
      enum: [
        'unlimited_projects',
        'unlimited_tasks',
        'advanced_analytics',
        'custom_fields',
        'api_access',
        'priority_support',
        'white_label',
        'sso',
        'audit_logs'
      ]
    }]
  },
  compliance: {
    data_retention_days: {
      type: Number,
      default: 2555 // 7 years
    },
    gdpr_compliant: {
      type: Boolean,
      default: true
    },
    audit_logging: {
      type: Boolean,
      default: true
    },
    data_encryption: {
      type: Boolean,
      default: true
    }
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });
brandSchema.index({ status: 1 });
brandSchema.index({ 'subscription.plan': 1 });
brandSchema.index({ created_by: 1 });

// Virtual for user count
brandSchema.virtual('user_count', {
  ref: 'UserBrand',
  localField: '_id',
  foreignField: 'brand_id',
  count: true
});

// Virtual for project count
brandSchema.virtual('project_count', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'brand_id',
  count: true
});

// Pre-save middleware to generate slug
brandSchema.pre('save', function(next) {
  if (this.name) {
    // Always generate slug from name if not provided
    if (!this.slug || this.slug === '' || this.slug === null) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    }
  }
  next();
});

// Method to check if brand is active
brandSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Method to check if trial is expired
brandSchema.methods.isTrialExpired = function() {
  return this.subscription.status === 'trial' && 
         this.subscription.trial_ends_at < new Date();
};

// Method to get subscription limits
brandSchema.methods.getSubscriptionLimits = function() {
  const limits = {
    free: { users: 5, projects: 10, tasks: 100 },
    basic: { users: 25, projects: 50, tasks: 1000 },
    premium: { users: 100, projects: 200, tasks: 10000 },
    enterprise: { users: -1, projects: -1, tasks: -1 } // -1 means unlimited
  };
  
  return limits[this.subscription.plan] || limits.free;
};

module.exports = mongoose.model('Brand', brandSchema);
