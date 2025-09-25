const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserBrand = require('../models/UserBrand');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided, authorization denied'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token is not valid'
        }
      });
    }

    // Add multi-brand context to request
    req.user = user;
    req.userBrands = decoded.brands || [];
    req.currentBrand = decoded.currentBrand || null;
    
    // Add brand context from JWT token if available
    if (decoded.brandId) {
      req.brandId = decoded.brandId;
      req.userRole = decoded.role;
      req.userPermissions = decoded.permissions;
    }
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is not valid'
      }
    });
  }
};

module.exports = auth;
