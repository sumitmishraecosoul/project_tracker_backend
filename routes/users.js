const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAssignableUsers,
  getMyTeam
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const UserBrand = require('../models/UserBrand');

// Helper endpoints should be declared BEFORE dynamic :id route
router.get('/helpers/assignable-users', auth, getAssignableUsers);
router.get('/helpers/my-team', auth, getMyTeam);

// User invitations route - MUST be before /:id route
router.get('/invitations', auth, async (req, res) => {
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

router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.post('/', auth, createUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;
