const mongoose = require('mongoose');

const userBrandSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'member', 'client', 'guest'],
    default: 'member'
  },
  permissions: {
    // Project permissions
    can_create_projects: {
      type: Boolean,
      default: false
    },
    can_edit_projects: {
      type: Boolean,
      default: false
    },
    can_delete_projects: {
      type: Boolean,
      default: false
    },
    can_view_all_projects: {
      type: Boolean,
      default: true
    },
    
    // Task permissions
    can_create_tasks: {
      type: Boolean,
      default: true
    },
    can_edit_tasks: {
      type: Boolean,
      default: true
    },
    can_delete_tasks: {
      type: Boolean,
      default: false
    },
    can_assign_tasks: {
      type: Boolean,
      default: false
    },
    
    // User management
    can_manage_users: {
      type: Boolean,
      default: false
    },
    can_invite_users: {
      type: Boolean,
      default: false
    },
    can_remove_users: {
      type: Boolean,
      default: false
    },
    
    // Analytics and reporting
    can_view_analytics: {
      type: Boolean,
      default: false
    },
    can_export_data: {
      type: Boolean,
      default: false
    },
    can_generate_reports: {
      type: Boolean,
      default: false
    },
    
    // Brand management
    can_manage_brand_settings: {
      type: Boolean,
      default: false
    },
    can_manage_billing: {
      type: Boolean,
      default: false
    }
  },
  joined_at: {
    type: Date,
    default: Date.now
  },
  invited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended', 'expired'],
    default: 'pending'
  },
  expires_at: {
    type: Date,
    default: null
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

// Compound index for user-brand relationship
userBrandSchema.index({ user_id: 1, brand_id: 1 }, { unique: true });
userBrandSchema.index({ brand_id: 1, role: 1 });
userBrandSchema.index({ brand_id: 1, status: 1 });
userBrandSchema.index({ user_id: 1, status: 1 });

// Virtual for user details
userBrandSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true
});

// Virtual for brand details
userBrandSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brand_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to set default permissions based on role
userBrandSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    this.setDefaultPermissions();
  }
  next();
});

// Method to set default permissions based on role
userBrandSchema.methods.setDefaultPermissions = function() {
  const rolePermissions = {
    owner: {
      can_create_projects: true,
      can_edit_projects: true,
      can_delete_projects: true,
      can_view_all_projects: true,
      can_create_tasks: true,
      can_edit_tasks: true,
      can_delete_tasks: true,
      can_assign_tasks: true,
      can_manage_users: true,
      can_invite_users: true,
      can_remove_users: true,
      can_view_analytics: true,
      can_export_data: true,
      can_generate_reports: true,
      can_manage_brand_settings: true,
      can_manage_billing: true
    },
    admin: {
      can_create_projects: true,
      can_edit_projects: true,
      can_delete_projects: true,
      can_view_all_projects: true,
      can_create_tasks: true,
      can_edit_tasks: true,
      can_delete_tasks: true,
      can_assign_tasks: true,
      can_manage_users: true,
      can_invite_users: true,
      can_remove_users: true,
      can_view_analytics: true,
      can_export_data: true,
      can_generate_reports: true,
      can_manage_brand_settings: true,
      can_manage_billing: false
    },
    manager: {
      can_create_projects: true,
      can_edit_projects: true,
      can_delete_projects: false,
      can_view_all_projects: true,
      can_create_tasks: true,
      can_edit_tasks: true,
      can_delete_tasks: true,
      can_assign_tasks: true,
      can_manage_users: false,
      can_invite_users: true,
      can_remove_users: false,
      can_view_analytics: true,
      can_export_data: false,
      can_generate_reports: true,
      can_manage_brand_settings: false,
      can_manage_billing: false
    },
    member: {
      can_create_projects: false,
      can_edit_projects: false,
      can_delete_projects: false,
      can_view_all_projects: true,
      can_create_tasks: true,
      can_edit_tasks: true,
      can_delete_tasks: false,
      can_assign_tasks: false,
      can_manage_users: false,
      can_invite_users: false,
      can_remove_users: false,
      can_view_analytics: false,
      can_export_data: false,
      can_generate_reports: false,
      can_manage_brand_settings: false,
      can_manage_billing: false
    },
    client: {
      can_create_projects: false,
      can_edit_projects: false,
      can_delete_projects: false,
      can_view_all_projects: false,
      can_create_tasks: false,
      can_edit_tasks: false,
      can_delete_tasks: false,
      can_assign_tasks: false,
      can_manage_users: false,
      can_invite_users: false,
      can_remove_users: false,
      can_view_analytics: false,
      can_export_data: false,
      can_generate_reports: false,
      can_manage_brand_settings: false,
      can_manage_billing: false
    },
    guest: {
      can_create_projects: false,
      can_edit_projects: false,
      can_delete_projects: false,
      can_view_all_projects: false,
      can_create_tasks: false,
      can_edit_tasks: false,
      can_delete_tasks: false,
      can_assign_tasks: false,
      can_manage_users: false,
      can_invite_users: false,
      can_remove_users: false,
      can_view_analytics: false,
      can_export_data: false,
      can_generate_reports: false,
      can_manage_brand_settings: false,
      can_manage_billing: false
    }
  };

  const permissions = rolePermissions[this.role] || rolePermissions.member;
  Object.assign(this.permissions, permissions);
};

// Method to check if user has specific permission
userBrandSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to check if user is active
userBrandSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Method to check if access is expired
userBrandSchema.methods.isExpired = function() {
  return this.expires_at && this.expires_at < new Date();
};

// Static method to get user's brands
userBrandSchema.statics.getUserBrands = function(userId) {
  return this.find({ user_id: userId, status: 'active' })
    .populate('brand_id', 'name slug status subscription')
    .populate('user_id', 'name email');
};

// Static method to get brand's users
userBrandSchema.statics.getBrandUsers = function(brandId) {
  return this.find({ brand_id: brandId })
    .populate('user_id', 'name email avatarUrl')
    .populate('invited_by', 'name email');
};

module.exports = mongoose.model('UserBrand', userBrandSchema);

