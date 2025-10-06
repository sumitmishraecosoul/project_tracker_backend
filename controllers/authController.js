const User = require('../models/User');
const UserBrand = require('../models/UserBrand');
const Brand = require('../models/Brand');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name: rawName, fullName, email: rawEmail, workEmail, password, role, department, manager, employeeNumber, jobTitle, location } = req.body;

    const name = rawName || fullName;
    const email = rawEmail || workEmail;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Signup failed', error: 'Name is required' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Signup failed', error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Signup failed', error: 'Password is required' });
    }
    if (!employeeNumber) {
      return res.status(400).json({ message: 'Signup failed', error: 'Employee Number is required. Please provide a unique employee number for this user.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Check if employee number already exists
    const existingEmployee = await User.findOne({ employeeNumber });
    if (existingEmployee) {
      return res.status(409).json({ 
        message: 'Signup failed', 
        error: `Employee Number '${employeeNumber}' already exists. Please use a different employee number.` 
      });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({ 
      name, 
      email, 
      password: password,
      role: role || undefined,
      department: department || undefined,
      manager: manager || null,
      employeeNumber: employeeNumber,
      jobTitle: jobTitle || null,
      location: location || null
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ message: 'User created successfully', user: safeUser });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern) {
      if (err.keyPattern.email) {
        return res.status(409).json({ message: 'Signup failed', error: 'Email already exists' });
      }
      if (err.keyPattern.employeeNumber) {
        return res.status(409).json({ message: 'Signup failed', error: 'Employee Number already exists' });
      }
    }
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password, currentBrandId } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Get user's brands
    let userBrands = [];
    let brands = [];
    
    if (user.role === 'admin') {
      // Admin users can see ALL brands
      const allBrands = await Brand.find({ status: { $ne: 'deleted' } });
      brands = allBrands.map(brand => ({
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        role: 'admin',
        permissions: {},
        status: 'active'
      }));
    } else {
      // Non-admin users get brands from UserBrand relationships
      userBrands = await UserBrand.getUserBrands(user._id);
      brands = userBrands.map(ub => ({
        id: ub.brand_id._id,
        name: ub.brand_id.name,
        slug: ub.brand_id.slug,
        role: ub.role,
        permissions: ub.permissions,
        status: ub.status
      }));
    }

    // Determine current brand
    let currentBrand = null;
    if (currentBrandId) {
      // Validate that user has access to the requested brand
      const userBrand = userBrands.find(ub => ub.brand_id._id.toString() === currentBrandId);
      if (userBrand && userBrand.status === 'active') {
        currentBrand = {
          id: userBrand.brand_id._id,
          name: userBrand.brand_id.name,
          slug: userBrand.brand_id.slug,
          role: userBrand.role,
          permissions: userBrand.permissions
        };
      }
    }

    // If no current brand specified or invalid, use the first available brand
    if (!currentBrand && brands.length > 0) {
      const firstActiveBrand = brands.find(b => b.status === 'active');
      if (firstActiveBrand) {
        currentBrand = firstActiveBrand;
      }
    }

    // Create JWT token with multi-brand support
    const tokenPayload = {
      userId: user._id,
      brands: brands,
      currentBrand: currentBrand
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    const { password: _, ...safeUser } = user.toObject();
    res.status(200).json({ 
      token, 
      user: safeUser,
      brands: brands,
      currentBrand: currentBrand
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, department, role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // In a real app, send email with reset token
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset email', error: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // In a real app, verify token and update password
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  };
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  };
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh token', error: err.message });
  };
};

// Switch brand
exports.switchBrand = async (req, res) => {
  try {
    const { brandId } = req.body;
    const userId = req.user.id;

    if (!brandId) {
      return res.status(400).json({ 
        success: false,
        error: { 
          code: 'MISSING_BRAND_ID',
          message: 'Brand ID is required' 
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
        user_id: userId,
        brand_id: brand,
        role: 'admin',
        permissions: {},
        status: 'active'
      };
    } else {
      // Non-admin users need UserBrand entry
      userBrand = await UserBrand.findOne({
        user_id: userId,
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

    // Get all user's brands for the new token
    const userBrands = await UserBrand.getUserBrands(userId);
    const brands = userBrands.map(ub => ({
      id: ub.brand_id._id,
      name: ub.brand_id.name,
      slug: ub.brand_id.slug,
      role: ub.role,
      permissions: ub.permissions,
      status: ub.status
    }));

    // Set the new current brand
    const currentBrand = {
      id: userBrand.brand_id._id,
      name: userBrand.brand_id.name,
      slug: userBrand.brand_id.slug,
      role: userBrand.role,
      permissions: userBrand.permissions
    };

    // Create new JWT token with updated brand context
    const tokenPayload = {
      userId: userId,
      brands: brands,
      currentBrand: currentBrand
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      token: token,
      currentBrand: currentBrand,
      brands: brands,
      message: 'Brand switched successfully'
    });
  } catch (err) {
    console.error('Error switching brand:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_SWITCH_ERROR',
        message: 'Failed to switch brand',
        details: err.message
      }
    });
  }
};
