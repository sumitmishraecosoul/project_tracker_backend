const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name: rawName, fullName, email: rawEmail, workEmail, password, role, department, manager, employeeNumber, jobTitle, location } = req.body;

    const name = rawName || fullName;
    const email = rawEmail || workEmail;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: role || undefined,
      department: department || undefined,
      manager: manager || null,
      employeeNumber: employeeNumber || null,
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
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const { password: _, ...safeUser } = user.toObject();
    res.status(200).json({ token, user: safeUser });
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
