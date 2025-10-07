/**
 * Basic role-based authorization middleware
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorize = function(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }
      
      if (allowedRoles.length === 0) {
        return next();
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'INSUFFICIENT_ROLE',
            message: 'Forbidden: insufficient role'
          }
        });
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Brand-aware role-based authorization middleware
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorizeBrand = function(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }

      if (!req.brandId || !req.userBrand) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BRAND_CONTEXT',
            message: 'Brand context is required'
          }
        });
      }

      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user has the required role in this brand
      // Admin users have access to all brands regardless of brand-specific role
      if (req.user.role === 'admin') {
        // Admin users can perform any action in any brand
        return next();
      }
      
      if (!allowedRoles.includes(req.userRole)) {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'INSUFFICIENT_BRAND_ROLE',
            message: 'Forbidden: insufficient role in this brand'
          }
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Permission-based authorization middleware
 * @param {String} permission - Required permission
 */
const requirePermission = function(permission) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }

      if (!req.brandId || !req.userBrand) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BRAND_CONTEXT',
            message: 'Brand context is required'
          }
        });
      }

      // Check if user has the required permission
      if (!req.userPermissions || !req.userPermissions[permission]) {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSION',
            message: `Forbidden: insufficient permission. Required: ${permission}`
          }
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Multiple permissions authorization middleware
 * @param {Array} permissions - Array of required permissions (user needs ALL)
 */
const requireAllPermissions = function(permissions = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }

      if (!req.brandId || !req.userBrand) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BRAND_CONTEXT',
            message: 'Brand context is required'
          }
        });
      }

      if (permissions.length === 0) {
        return next();
      }

      // Check if user has ALL required permissions
      const missingPermissions = permissions.filter(permission => 
        !req.userPermissions || !req.userPermissions[permission]
      );

      if (missingPermissions.length > 0) {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Forbidden: insufficient permissions. Missing: ${missingPermissions.join(', ')}`
          }
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Any permission authorization middleware
 * @param {Array} permissions - Array of permissions (user needs ANY)
 */
const requireAnyPermission = function(permissions = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }

      if (!req.brandId || !req.userBrand) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BRAND_CONTEXT',
            message: 'Brand context is required'
          }
        });
      }

      if (permissions.length === 0) {
        return next();
      }

      // Check if user has ANY of the required permissions
      const hasPermission = permissions.some(permission => 
        req.userPermissions && req.userPermissions[permission]
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Forbidden: insufficient permissions. Required any of: ${permissions.join(', ')}`
          }
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Admin override middleware
 * Allows admins to access any brand regardless of their brand-specific permissions
 */
const adminOverride = function() {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
          }
        });
      }

      // If user is admin, allow access regardless of brand context
      if (req.user.role === 'admin') {
        req.isAdminOverride = true;
        return next();
      }

      // For non-admin users, continue with normal brand context validation
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  authorize,
  authorizeBrand,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  adminOverride
};


