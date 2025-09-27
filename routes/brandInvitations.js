const express = require('express');
const router = express.Router();
const UserBrand = require('../models/UserBrand');
const Brand = require('../models/Brand');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware invitation routes
// All routes require authentication and brand context

// @route   GET /api/brands/:brandId/invitations/pending
// @desc    Get pending invitations for a brand
// @access  Private (Admin/Manager only)
router.get('/:brandId/invitations/pending', auth, brandContext, async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    // Check if user has permission to view pending invitations
    const userBrand = await UserBrand.findOne({
      user_id: userId,
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

// @route   GET /api/brands/:brandId/invitations/user/me
// @desc    Get user's pending invitations for a specific brand
// @access  Private (User only)
router.get('/:brandId/invitations/user/me', auth, async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    // Get pending invitations for this user in this brand
    const invitations = await UserBrand.find({
      user_id: userId,
      brand_id: brandId,
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
        code: 'USER_INVITATIONS_FETCH_ERROR',
        message: 'Failed to fetch user invitations',
        details: error.message
      }
    });
  }
});

// @route   GET /api/brands/:brandId/invitations/:id
// @desc    Get invitation details
// @access  Private (User or Admin/Manager)
router.get('/:brandId/invitations/:id', auth, async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    // Find the invitation
    const invitation = await UserBrand.findOne({
      _id: id,
      brand_id: brandId
    })
    .populate('user_id', 'name email avatar')
    .populate('brand_id', 'name description industry website')
    .populate('invited_by', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVITATION_NOT_FOUND',
          message: 'Invitation not found'
        }
      });
    }

    // Check if user has permission to view this invitation
    const isInvitedUser = invitation.user_id._id.toString() === userId;
    const isAdmin = await UserBrand.findOne({
      user_id: userId,
      brand_id: brandId,
      status: 'active'
    }).then(ub => ub && ub.hasPermission('can_manage_users'));

    if (!isInvitedUser && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to view this invitation'
        }
      });
    }

    const formattedInvitation = {
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
      expires_at: invitation.expires_at,
      joined_at: invitation.joined_at
    };

    res.json({
      success: true,
      data: formattedInvitation,
      message: 'Invitation details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching invitation details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVITATION_DETAILS_FETCH_ERROR',
        message: 'Failed to fetch invitation details',
        details: error.message
      }
    });
  }
});

// @route   PUT /api/brands/:brandId/invitations/:id/accept
// @desc    Accept invitation
// @access  Private (Invited user only)
router.put('/:brandId/invitations/:id/accept', auth, async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    // Find the invitation
    const invitation = await UserBrand.findOne({
      _id: id,
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

// @route   PUT /api/brands/:brandId/invitations/:id/decline
// @desc    Decline invitation
// @access  Private (Invited user only)
router.put('/:brandId/invitations/:id/decline', auth, async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const userId = req.user.id;

    // Find the invitation
    const invitation = await UserBrand.findOne({
      _id: id,
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

// @route   DELETE /api/brands/:brandId/invitations/:id
// @desc    Delete invitation (Admin/Manager only)
// @access  Private (Admin/Manager only)
router.delete('/:brandId/invitations/:id', auth, brandContext, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { brandId, id } = req.params;

    // Check if user has permission to delete invitations
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
          message: 'Insufficient permissions to delete invitations'
        }
      });
    }

    // Find and delete the invitation
    const invitation = await UserBrand.findOneAndDelete({
      _id: id,
      brand_id: brandId,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVITATION_NOT_FOUND',
          message: 'Invitation not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Invitation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVITATION_DELETE_ERROR',
        message: 'Failed to delete invitation',
        details: error.message
      }
    });
  }
});


module.exports = router;
