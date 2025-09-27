const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const UserBrand = require('../models/UserBrand');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// @route   GET /api/brands/:brandId/users
// @desc    Get all users in a brand
// @access  Private
router.get('/:brandId/users', auth, async (req, res) => {
  try {
    const brandId = req.params.brandId;

    // Check if user has access to this brand
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this brand'
        }
      });
    }

    const brandUsers = await UserBrand.getBrandUsers(brandId);
    
    const users = brandUsers.map(ub => ({
      id: ub.user_id._id,
      name: ub.user_id.name,
      email: ub.user_id.email,
      avatar: ub.user_id.avatarUrl,
      role: ub.role,
      permissions: ub.permissions,
      status: ub.status,
      joined_at: ub.joined_at,
      invited_by: ub.invited_by ? {
        id: ub.invited_by._id,
        name: ub.invited_by.name,
        email: ub.invited_by.email
      } : null
    }));

    res.json({
      success: true,
      data: users,
      message: 'Brand users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USERS_FETCH_ERROR',
        message: 'Failed to fetch brand users',
        details: error.message
      }
    });
  }
});

// @route   POST /api/brands/:brandId/users
// @desc    Add user to brand
// @access  Private (Admin/Manager only)
router.post('/:brandId/users', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const { email, role = 'member', permissions } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          field_errors: {
            email: 'Email is required'
          }
        }
      });
    }

    // Check if user has permission to add users
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_invite_users')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to add users'
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check if user is already in this brand
    const existingUserBrand = await UserBrand.findOne({
      user_id: user._id,
      brand_id: brandId
    });

    if (existingUserBrand) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ALREADY_IN_BRAND',
          message: 'User is already in this brand'
        }
      });
    }

    // Create UserBrand relationship
    const newUserBrand = await UserBrand.create({
      user_id: user._id,
      brand_id: brandId,
      role,
      permissions: permissions || {},
      invited_by: req.user.id,
      status: 'active'
    });

    // Populate the created relationship
    await newUserBrand.populate([
      { path: 'user_id', select: 'name email avatarUrl' },
      { path: 'invited_by', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: newUserBrand._id,
        user: {
          id: newUserBrand.user_id._id,
          name: newUserBrand.user_id.name,
          email: newUserBrand.user_id.email,
          avatar: newUserBrand.user_id.avatarUrl
        },
        role: newUserBrand.role,
        permissions: newUserBrand.permissions,
        status: newUserBrand.status,
        joined_at: newUserBrand.joined_at,
        invited_by: {
          id: newUserBrand.invited_by._id,
          name: newUserBrand.invited_by.name,
          email: newUserBrand.invited_by.email
        }
      },
      message: 'User added to brand successfully'
    });
  } catch (error) {
    console.error('Error adding user to brand:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_ADD_ERROR',
        message: 'Failed to add user to brand',
        details: error.message
      }
    });
  }
});

// @route   PUT /api/brands/:brandId/users/:userId
// @desc    Update user role in brand
// @access  Private (Admin/Manager only)
router.put('/:brandId/users/:userId', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { brandId, userId } = req.params;
    const { role, permissions } = req.body;

    // Check if user has permission to manage users
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_manage_users')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to manage users'
        }
      });
    }

    // Find the user-brand relationship to update
    const targetUserBrand = await UserBrand.findOne({
      user_id: userId,
      brand_id: brandId
    });

    if (!targetUserBrand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_IN_BRAND',
          message: 'User is not in this brand'
        }
      });
    }

    // Prevent users from changing their own role to lower level
    if (userId === req.user.id && role && role !== userBrand.role) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CHANGE_OWN_ROLE',
          message: 'Cannot change your own role'
        }
      });
    }

    // Update user role and permissions
    const updateData = {};
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;

    const updatedUserBrand = await UserBrand.findByIdAndUpdate(
      targetUserBrand._id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user_id', select: 'name email avatarUrl' },
      { path: 'invited_by', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: {
        id: updatedUserBrand._id,
        user: {
          id: updatedUserBrand.user_id._id,
          name: updatedUserBrand.user_id.name,
          email: updatedUserBrand.user_id.email,
          avatar: updatedUserBrand.user_id.avatarUrl
        },
        role: updatedUserBrand.role,
        permissions: updatedUserBrand.permissions,
        status: updatedUserBrand.status,
        joined_at: updatedUserBrand.joined_at,
        invited_by: updatedUserBrand.invited_by ? {
          id: updatedUserBrand.invited_by._id,
          name: updatedUserBrand.invited_by.name,
          email: updatedUserBrand.invited_by.email
        } : null
      },
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_UPDATE_ERROR',
        message: 'Failed to update user role',
        details: error.message
      }
    });
  }
});

// @route   DELETE /api/brands/:brandId/users/:userId
// @desc    Remove user from brand
// @access  Private (Admin/Manager only)
router.delete('/:brandId/users/:userId', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { brandId, userId } = req.params;

    // Check if user has permission to remove users
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_remove_users')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to remove users'
        }
      });
    }

    // Prevent users from removing themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_REMOVE_SELF',
          message: 'Cannot remove yourself from brand'
        }
      });
    }

    // Find the user-brand relationship to remove
    const targetUserBrand = await UserBrand.findOne({
      user_id: userId,
      brand_id: brandId
    });

    if (!targetUserBrand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_IN_BRAND',
          message: 'User is not in this brand'
        }
      });
    }

    // Soft delete the relationship
    await UserBrand.findByIdAndUpdate(targetUserBrand._id, {
      status: 'suspended'
    });

    res.json({
      success: true,
      message: 'User removed from brand successfully'
    });
  } catch (error) {
    console.error('Error removing user from brand:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_REMOVE_ERROR',
        message: 'Failed to remove user from brand',
        details: error.message
      }
    });
  }
});

// @route   POST /api/brands/:brandId/users/invite
// @desc    Invite user to brand
// @access  Private (Admin/Manager only)
router.post('/:brandId/users/invite', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const { email, role = 'member', message } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          field_errors: {
            email: 'Email is required'
          }
        }
      });
    }

    // Check if user has permission to invite users
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_invite_users')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to invite users'
        }
      });
    }

    // Check if user exists in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in database',
          details: 'Please enter a correct email address of an existing user'
        }
      });
    }

    // Check if user is already in this brand
    const existingUserBrand = await UserBrand.findOne({
      user_id: user._id,
      brand_id: brandId
    });

    if (existingUserBrand) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ALREADY_IN_BRAND',
          message: 'User is already in this brand'
        }
      });
    }

    // Create pending invitation
    const invitation = await UserBrand.create({
      user_id: user._id,
      brand_id: brandId,
      role,
      permissions: {},
      invited_by: req.user.id,
      status: 'pending'
    });

    // TODO: Send invitation email
    // For now, just return success

    res.status(201).json({
      success: true,
      data: {
        id: invitation._id,
        email: user.email,
        role: invitation.role,
        status: invitation.status,
        invited_at: invitation.created_at
      },
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVITATION_ERROR',
        message: 'Failed to send invitation',
        details: error.message
      }
    });
  }
});

// @route   POST /api/brands/:brandId/users/accept
// @desc    Accept brand invitation
// @access  Private (Invited user only)
router.post('/:brandId/users/accept', auth, async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const userId = req.user.id;

    // Find pending invitation
    const invitation = await UserBrand.findOne({
      user_id: userId,
      brand_id: brandId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVITATION_NOT_FOUND',
          message: 'No pending invitation found for this brand'
        }
      });
    }

    // Accept invitation
    invitation.status = 'active';
    invitation.joined_at = new Date();
    await invitation.save();

    // Populate user and brand details
    await invitation.populate('user_id', 'name email avatar');
    await invitation.populate('brand_id', 'name description');

    res.json({
      success: true,
      data: {
        id: invitation._id,
        user: {
          id: invitation.user_id._id,
          name: invitation.user_id.name,
          email: invitation.user_id.email,
          avatar: invitation.user_id.avatar
        },
        brand: {
          id: invitation.brand_id._id,
          name: invitation.brand_id.name,
          description: invitation.brand_id.description
        },
        role: invitation.role,
        status: invitation.status,
        joined_at: invitation.joined_at,
        permissions: invitation.permissions
      },
      message: 'Invitation accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVITATION_ACCEPT_ERROR',
        message: 'Failed to accept invitation',
        details: error.message
      }
    });
  }
});

// @route   POST /api/brands/:brandId/users/decline
// @desc    Decline brand invitation
// @access  Private (Invited user only)
router.post('/:brandId/users/decline', auth, async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const userId = req.user.id;

    // Find pending invitation
    const invitation = await UserBrand.findOne({
      user_id: userId,
      brand_id: brandId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVITATION_NOT_FOUND',
          message: 'No pending invitation found for this brand'
        }
      });
    }

    // Decline invitation
    invitation.status = 'declined';
    await invitation.save();

    res.json({
      success: true,
      message: 'Invitation declined successfully'
    });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVITATION_DECLINE_ERROR',
        message: 'Failed to decline invitation',
        details: error.message
      }
    });
  }
});

// @route   GET /api/users/invitations
// @desc    Get user's pending invitations
// @access  Private (User only)
router.get('/users/invitations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all pending invitations for user
    const invitations = await UserBrand.find({
      user_id: userId,
      status: 'pending'
    })
    .populate('brand_id', 'name description industry website')
    .populate('invited_by', 'name email')
    .sort({ created_at: -1 });

    const formattedInvitations = invitations.map(invitation => ({
      id: invitation._id,
      brand: {
        id: invitation.brand_id._id,
        name: invitation.brand_id.name,
        description: invitation.brand_id.description,
        industry: invitation.brand_id.industry,
        website: invitation.brand_id.website
      },
      role: invitation.role,
      status: invitation.status,
      invited_by: {
        id: invitation.invited_by._id,
        name: invitation.invited_by.name,
        email: invitation.invited_by.email
      },
      invited_at: invitation.created_at,
      expires_at: invitation.expires_at
    }));

    res.json({
      success: true,
      data: formattedInvitations,
      message: 'User invitations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVITATIONS_FETCH_ERROR',
        message: 'Failed to fetch user invitations',
        details: error.message
      }
    });
  }
});

// @route   GET /api/brands/:brandId/users/pending
// @desc    Get pending invitations for a brand
// @access  Private (Admin/Manager only)
router.get('/:brandId/users/pending', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const brandId = req.params.brandId;

    // Check if user has permission to view pending invitations
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_manage_users')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to view pending invitations'
        }
      });
    }

    // Get pending invitations for this brand
    const pendingInvitations = await UserBrand.find({
      brand_id: brandId,
      status: 'pending'
    })
    .populate('user_id', 'name email avatar')
    .populate('invited_by', 'name email')
    .sort({ created_at: -1 });

    const formattedInvitations = pendingInvitations.map(invitation => ({
      id: invitation._id,
      user: {
        id: invitation.user_id._id,
        name: invitation.user_id.name,
        email: invitation.user_id.email,
        avatar: invitation.user_id.avatar
      },
      role: invitation.role,
      status: invitation.status,
      invited_by: {
        id: invitation.invited_by._id,
        name: invitation.invited_by.name,
        email: invitation.invited_by.email
      },
      invited_at: invitation.created_at,
      expires_at: invitation.expires_at
    }));

    res.json({
      success: true,
      data: formattedInvitations,
      message: 'Pending invitations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PENDING_INVITATIONS_FETCH_ERROR',
        message: 'Failed to fetch pending invitations',
        details: error.message
      }
    });
  }
});

// @route   PUT /api/brands/:brandId/users/:userId/status
// @desc    Update user status in brand
// @access  Private (Admin/Manager only)
router.put('/:brandId/users/:userId/status', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { brandId, userId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'pending', 'suspended', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        }
      });
    }

    // Check if user has permission to manage users
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_manage_users')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to update user status'
        }
      });
    }

    // Find the user-brand relationship
    const targetUserBrand = await UserBrand.findOne({
      user_id: userId,
      brand_id: brandId
    });

    if (!targetUserBrand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in this brand'
        }
      });
    }

    // Update status
    targetUserBrand.status = status;
    if (status === 'active' && !targetUserBrand.joined_at) {
      targetUserBrand.joined_at = new Date();
    }
    await targetUserBrand.save();

    // Populate user details
    await targetUserBrand.populate('user_id', 'name email avatar');

    res.json({
      success: true,
      data: {
        id: targetUserBrand._id,
        user: {
          id: targetUserBrand.user_id._id,
          name: targetUserBrand.user_id.name,
          email: targetUserBrand.user_id.email,
          avatar: targetUserBrand.user_id.avatar
        },
        role: targetUserBrand.role,
        status: targetUserBrand.status,
        joined_at: targetUserBrand.joined_at,
        updated_at: targetUserBrand.updated_at
      },
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_STATUS_UPDATE_ERROR',
        message: 'Failed to update user status',
        details: error.message
      }
    });
  }
});

module.exports = router;

