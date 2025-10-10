const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Brand = require('../models/Brand');
const UserBrand = require('../models/UserBrand');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// @route   GET /api/brands
// @desc    Get all brands for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get the user's global role
    const user = await User.findById(req.user.id).select('role');
    
    let brands = [];
    
    // Admin (Primary Admin) can see ALL brands
    if (user.role === 'admin') {
      const allBrands = await Brand.find({ status: { $ne: 'deleted' } })
        .populate('created_by', 'name email')
        .sort({ created_at: -1 });
      
      brands = allBrands.map(brand => ({
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        status: brand.status,
        role: 'admin', // Admin has admin role in all brands
        permissions: {}, // Admin has all permissions
        joined_at: brand.created_at,
        subscription: brand.subscription,
        is_global_admin: true
      }));
    } 
    // Brand Admin and User can only see brands they're associated with
    else {
      const userBrands = await UserBrand.getUserBrands(req.user.id);
      
      brands = userBrands.map(ub => ({
        id: ub.brand_id._id,
        name: ub.brand_id.name,
        slug: ub.brand_id.slug,
        description: ub.brand_id.description,
        logo: ub.brand_id.logo,
        status: ub.brand_id.status,
        role: ub.role,
        permissions: ub.permissions,
        joined_at: ub.joined_at,
        subscription: ub.brand_id.subscription,
        is_global_admin: false
      }));
    }

    res.json({
      success: true,
      data: brands,
      message: 'Brands retrieved successfully',
      user_global_role: user.role
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRANDS_FETCH_ERROR',
        message: 'Failed to fetch brands',
        details: error.message
      }
    });
  }
});

// @route   GET /api/brands/:id
// @desc    Get brand details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Validate ObjectId format to prevent casting errors
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID format'
        }
      });
    }
    
    // Check if user has access to this brand
    // Admin users have access to ALL brands
    if (req.user.role !== 'admin') {
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
    }

    const brand = await Brand.findById(brandId)
      .populate('created_by', 'name email');

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: 'Brand not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        status: brand.status,
        settings: brand.settings,
        subscription: brand.subscription,
        compliance: brand.compliance,
        created_by: brand.created_by,
        created_at: brand.created_at,
        updated_at: brand.updated_at,
        user_role: userBrand.role,
        user_permissions: userBrand.permissions
      },
      message: 'Brand details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_FETCH_ERROR',
        message: 'Failed to fetch brand details',
        details: error.message
      }
    });
  }
});

// @route   POST /api/brands
// @desc    Create a new brand
// @access  Private (Admin and Brand Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, logo, settings } = req.body;

    // Check if user has permission to create brands (only admin and brand_admin)
    const user = await User.findById(req.user.id).select('role');
    if (user.role !== 'admin' && user.role !== 'brand_admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only admins and brand admins can create brands'
        }
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Brand name is required',
          field_errors: {
            name: 'Brand name is required'
          }
        }
      });
    }

    // Check if brand name already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRAND_EXISTS',
          message: 'Brand with this name already exists',
          field_errors: {
            name: 'Brand name already exists'
          }
        }
      });
    }

    // Create brand
    const brand = await Brand.create({
      name,
      description,
      logo,
      settings: settings || {},
      created_by: req.user.id
    });

    // Add creator as owner
    await UserBrand.create({
      user_id: req.user.id,
      brand_id: brand._id,
      role: 'owner',
      permissions: {
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
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        status: brand.status,
        settings: brand.settings,
        subscription: brand.subscription,
        created_at: brand.created_at
      },
      message: 'Brand created successfully'
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_CREATE_ERROR',
        message: 'Failed to create brand',
        details: error.message
      }
    });
  }
});

// @route   PUT /api/brands/:id
// @desc    Update brand
// @access  Private (Owner/Admin only)
router.put('/:id', auth, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID format'
        }
      });
    }
    
    const { name, description, logo, settings, subscription } = req.body;

    // Check if user has permission to update this brand
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      status: 'active'
    });

    if (!userBrand || !userBrand.hasPermission('can_manage_brand_settings')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to update brand'
        }
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (settings) updateData.settings = { ...userBrand.brand_id.settings, ...settings };
    if (subscription) updateData.subscription = { ...userBrand.brand_id.subscription, ...subscription };

    const brand = await Brand.findByIdAndUpdate(
      brandId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: 'Brand not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        logo: brand.logo,
        status: brand.status,
        settings: brand.settings,
        subscription: brand.subscription,
        updated_at: brand.updated_at
      },
      message: 'Brand updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_UPDATE_ERROR',
        message: 'Failed to update brand',
        details: error.message
      }
    });
  }
});

// @route   DELETE /api/brands/:id
// @desc    Delete brand
// @access  Private (Owner only)
router.delete('/:id', auth, authorize(['owner']), async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID format'
        }
      });
    }

    // Check if user is the owner of this brand
    const userBrand = await UserBrand.findOne({
      user_id: req.user.id,
      brand_id: brandId,
      role: 'owner',
      status: 'active'
    });

    if (!userBrand) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Only brand owners can delete brands'
        }
      });
    }

    // Soft delete the brand
    await Brand.findByIdAndUpdate(brandId, { status: 'inactive' });

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_DELETE_ERROR',
        message: 'Failed to delete brand',
        details: error.message
      }
    });
  }
});

// @route   POST /api/brands/:id/switch
// @desc    Switch to a brand
// @access  Private
router.post('/:id/switch', auth, async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID format'
        }
      });
    }

    // Check if user has access to this brand
    // Admin users have access to ALL brands
    let userBrand;
    if (req.user.role === 'admin') {
      // Admin users don't need UserBrand entry - they have access to all brands
      const brand = await Brand.findById(brandId).select('name slug status subscription');
      if (!brand) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BRAND_NOT_FOUND',
            message: 'Brand not found'
          }
        });
      }
      
      userBrand = {
        user_id: req.user.id,
        brand_id: brand,
        role: 'admin',
        permissions: {},
        status: 'active'
      };
    } else {
      // Non-admin users need UserBrand entry
      userBrand = await UserBrand.findOne({
        user_id: req.user.id,
        brand_id: brandId,
        status: 'active'
      }).populate('brand_id', 'name slug status subscription');

      if (!userBrand) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this brand'
          }
        });
      }
    }

    // Check if brand is active
    if (userBrand.brand_id.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRAND_INACTIVE',
          message: 'Brand is not active'
        }
      });
    }

    // Generate new JWT token with brand context
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: userBrand.role,
        brandId: userBrand.brand_id._id,
        brandName: userBrand.brand_id.name,
        brandSlug: userBrand.brand_id.slug,
        permissions: userBrand.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        brand_id: userBrand.brand_id._id,
        brand_name: userBrand.brand_id.name,
        brand_slug: userBrand.brand_id.slug,
        role: userBrand.role,
        permissions: userBrand.permissions,
        subscription: userBrand.brand_id.subscription
      },
      token: token,
      message: 'Switched to brand successfully'
    });
  } catch (error) {
    console.error('Error switching brand:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SWITCH_ERROR',
        message: 'Failed to switch brand',
        details: error.message
      }
    });
  }
});

module.exports = router;

