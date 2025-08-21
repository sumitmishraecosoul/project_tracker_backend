const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.user?.role === 'manager') {
      filter.department = req.user.department;
    } else if (req.user?.role === 'employee') {
      filter.department = req.user.department;
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
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
    const { name: rawName, fullName, email: rawEmail, workEmail, password, role, department, manager, employeeNumber, jobTitle, location } = req.body;
    const name = rawName || fullName;
    const email = rawEmail || workEmail;
    
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
      department,
      manager: manager || null,
      employeeNumber: employeeNumber || null,
      jobTitle: jobTitle || null,
      location: location || null
    });
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('Error creating user:', err);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern) {
      if (err.keyPattern.email) {
        return res.status(409).json({ 
          error: 'Duplicate email',
          message: 'A user with this email already exists' 
        });
      }
      if (err.keyPattern.employeeNumber) {
        return res.status(409).json({ 
          error: 'Duplicate employeeNumber',
          message: 'A user with this employee number already exists' 
        });
      }
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

// New: Get assignable users list
exports.getAssignableUsers = async (req, res) => {
  try {
    const role = req.user.role;
    const me = (req.user.id || req.user._id).toString();
    const allActiveUsers = await User.find({ isActive: true }).select('_id name email role department manager');
    const response = allActiveUsers.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      // For tasks: admin and managers can assign across departments; employees only to self
      assignable: role === 'admin' || role === 'manager' ? true : u._id.toString() === me
    }));
    return res.json(response);
  } catch (err) {
    console.error('Error fetching assignable users:', err);
    res.status(500).json({ error: 'Failed to fetch assignable users', message: err.message });
  }
};

// New: Get team members for a manager (or self)
exports.getMyTeam = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'admin') {
      const department = req.query.department;
      const filter = department ? { department } : {};
      const everyone = await User.find(filter).select('_id name email role department');
      return res.json(everyone);
    }
    // For managers and employees: return everyone in the same department
    const team = await User.find({ department: user.department, isActive: true })
      .select('_id name email role department');
    return res.json(team);
  } catch (err) {
    console.error('Error fetching team members:', err);
    res.status(500).json({ error: 'Failed to fetch team members', message: err.message });
  }
};
