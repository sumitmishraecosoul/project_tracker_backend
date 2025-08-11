const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    // Return array directly, not wrapped in data/items
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: err.message 
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with the provided ID' 
      });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(400).json({ 
      error: 'Failed to fetch user',
      message: err.message 
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'name, email, and password are required' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      department 
    });
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('Error creating user:', err);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ 
        error: 'Duplicate email',
        message: 'A user with this email already exists' 
      });
    }
    
    res.status(400).json({ 
      error: 'Failed to create user',
      message: err.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with the provided ID' 
      });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ 
        error: 'Duplicate email',
        message: 'A user with this email already exists' 
      });
    }
    
    res.status(400).json({ 
      error: 'Failed to update user',
      message: err.message 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with the provided ID' 
      });
    }
    res.json({ 
      message: 'User deleted successfully',
      deletedUserId: user._id 
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(400).json({ 
      error: 'Failed to delete user',
      message: err.message 
    });
  }
};
