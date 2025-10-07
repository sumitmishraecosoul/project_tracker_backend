const UserBrand = require('../models/UserBrand');
const Brand = require('../models/Brand');

/**
 * Brand Context Middleware
 * Extracts brand ID from request and validates user access
 */
const brandContext = async (req, res, next) => {
  try {
    // Extract brand ID from various sources
    let brandId = null;
    
    // 1. From URL parameter (e.g., /api/brands/:brandId/...)
    if (req.params.brandId) {
      brandId = req.params.brandId;
    }
    
    // 2. From query parameter
    if (!brandId && req.query.brandId) {
      brandId = req.query.brandId;
    }
    
    // 3. From request body
    if (!brandId && req.body.brandId) {
      brandId = req.body.brandId;
    }
    
    // 4. From current brand in JWT token
    if (!brandId && req.currentBrand) {
      brandId = req.currentBrand.id;
    }

    if (!brandId || brandId === 'undefined' || brandId === 'null') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_BRAND_ID',
          message: 'Brand ID is required'
        }
      });
    }

    // Validate brandId is a valid ObjectId
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

    // Validate brand exists and is active
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: 'Brand not found'
        }
      });
    }

    if (brand.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRAND_INACTIVE',
          message: 'Brand is not active'
        }
      });
    }

    // Check user access to this brand
    // Admin users have access to ALL brands
    if (req.user.role === 'admin') {
      // Admin users don't need UserBrand entry - they have access to all brands
      req.userBrand = {
        user_id: req.user.id,
        brand_id: brandId,
        role: 'admin',
        permissions: {},
        status: 'active'
      };
      req.userRole = 'admin';
      req.userPermissions = {};
    } else {
      // Non-admin users need UserBrand entry
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

      req.userBrand = userBrand;
      req.userRole = userBrand.role;
      req.userPermissions = userBrand.permissions;
    }

    // Add brand context to request
    req.brand = brand;
    req.brandId = brandId;

    next();
  } catch (error) {
    console.error('Brand context middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_CONTEXT_ERROR',
        message: 'Failed to process brand context',
        details: error.message
      }
    });
  }
};

/**
 * Optional Brand Context Middleware
 * Similar to brandContext but doesn't require brand ID
 * Used for endpoints that can work with or without brand context
 */
const optionalBrandContext = async (req, res, next) => {
  try {
    // Extract brand ID from various sources
    let brandId = null;
    
    // 1. From URL parameter (e.g., /api/brands/:brandId/...)
    if (req.params.brandId) {
      brandId = req.params.brandId;
    }
    
    // 2. From query parameter
    if (!brandId && req.query.brandId) {
      brandId = req.query.brandId;
    }
    
    // 3. From request body
    if (!brandId && req.body.brandId) {
      brandId = req.body.brandId;
    }
    
    // 4. From current brand in JWT token
    if (!brandId && req.currentBrand) {
      brandId = req.currentBrand.id;
    }

    // If no brand ID provided, continue without brand context
    if (!brandId) {
      req.brand = null;
      req.userBrand = null;
      req.brandId = null;
      req.userRole = null;
      req.userPermissions = null;
      return next();
    }

    // Validate brand exists and is active
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: 'Brand not found'
        }
      });
    }

    if (brand.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRAND_INACTIVE',
          message: 'Brand is not active'
        }
      });
    }

    // Check user access to this brand
    // Admin users have access to ALL brands
    if (req.user.role === 'admin') {
      // Admin users don't need UserBrand entry - they have access to all brands
      req.userBrand = {
        user_id: req.user.id,
        brand_id: brandId,
        role: 'admin',
        permissions: {},
        status: 'active'
      };
      req.userRole = 'admin';
      req.userPermissions = {};
    } else {
      // Non-admin users need UserBrand entry
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

      req.userBrand = userBrand;
      req.userRole = userBrand.role;
      req.userPermissions = userBrand.permissions;
    }

    // Add brand context to request
    req.brand = brand;
    req.brandId = brandId;

    next();
  } catch (error) {
    console.error('Optional brand context middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_CONTEXT_ERROR',
        message: 'Failed to process brand context',
        details: error.message
      }
    });
  }
};

module.exports = {
  brandContext,
  optionalBrandContext
};