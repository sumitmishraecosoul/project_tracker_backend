const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/projects';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Get all projects with pagination and filtering
const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('teamMembers.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProjects: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('teamMembers.user', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Handle mixed projectId formats - search for both project ID and project title
    const tasks = await Task.find({ 
      $or: [
        { projectId: project._id.toString() },
        { projectId: project._id },
        { projectId: project.title }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ project, tasks });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      error: 'Failed to fetch project',
      message: error.message 
    });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, dueDate, assignedTo, teamMembers } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Project title is required'
      });
    }

    // Validate team members if provided
    if (teamMembers && Array.isArray(teamMembers)) {
      const teamMemberIds = teamMembers.map(tm => tm.user).filter(Boolean);
      
      if (teamMemberIds.length > 0) {
        // Check if all team member user IDs exist
        const existingUsers = await User.find({ _id: { $in: teamMemberIds } });
        const existingUserIds = existingUsers.map(user => user._id.toString());
        const invalidUserIds = teamMemberIds.filter(id => !existingUserIds.includes(id));
        
        if (invalidUserIds.length > 0) {
          return res.status(400).json({
            error: 'Invalid team members',
            message: `The following user IDs do not exist: ${invalidUserIds.join(', ')}`
          });
        }

        // Check for duplicate team members
        const uniqueUserIds = [...new Set(teamMemberIds)];
        if (uniqueUserIds.length !== teamMemberIds.length) {
          return res.status(400).json({
            error: 'Duplicate team members',
            message: 'Duplicate team members are not allowed'
          });
        }
      }
    }

    // Validate assignedTo if provided
    if (assignedTo && Array.isArray(assignedTo)) {
      const assignedToIds = assignedTo.filter(Boolean);
      
      if (assignedToIds.length > 0) {
        const existingUsers = await User.find({ _id: { $in: assignedToIds } });
        const existingUserIds = existingUsers.map(user => user._id.toString());
        const invalidUserIds = assignedToIds.filter(id => !existingUserIds.includes(id));
        
        if (invalidUserIds.length > 0) {
          return res.status(400).json({
            error: 'Invalid assigned users',
            message: `The following user IDs do not exist: ${invalidUserIds.join(', ')}`
          });
        }
      }
    }

    const projectData = {
      title: title.trim(),
      description: description?.trim(),
      status,
      priority,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo,
      teamMembers,
      createdBy: req.user.id
    };

    const project = new Project(projectData);
    await project.save();

    // Create notification for project creator
    await Notification.create({
      user: req.user.id,
      type: 'project_update',
      title: 'New Project Created',
      message: `Project "${project.title}" has been created successfully`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    // Create notifications for assigned users and team members
    const allUsers = [...(assignedTo || []), ...(teamMembers?.map(tm => tm.user) || [])];
    for (const userId of allUsers) {
      if (userId.toString() !== req.user.id) {
        await Notification.create({
          user: userId,
          type: 'project_update',
          title: 'Added to Project',
          message: `You have been added to project "${project.title}"`,
          relatedId: project._id,
          relatedModel: 'Project'
        });
      }
    }

    await project.populate('createdBy', 'name email');
    await project.populate('assignedTo', 'name email');
    await project.populate('teamMembers.user', 'name email');
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ 
      error: 'Failed to create project',
      message: error.message 
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Check if user has permission to update
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Not authorized to update this project' 
      });
    }

    // Validate team members if provided
    if (req.body.teamMembers && Array.isArray(req.body.teamMembers)) {
      const teamMemberIds = req.body.teamMembers.map(tm => tm.user).filter(Boolean);
      
      if (teamMemberIds.length > 0) {
        // Check if all team member user IDs exist
        const existingUsers = await User.find({ _id: { $in: teamMemberIds } });
        const existingUserIds = existingUsers.map(user => user._id.toString());
        const invalidUserIds = teamMemberIds.filter(id => !existingUserIds.includes(id));
        
        if (invalidUserIds.length > 0) {
          return res.status(400).json({
            error: 'Invalid team members',
            message: `The following user IDs do not exist: ${invalidUserIds.join(', ')}`
          });
        }

        // Check for duplicate team members
        const uniqueUserIds = [...new Set(teamMemberIds)];
        if (uniqueUserIds.length !== teamMemberIds.length) {
          return res.status(400).json({
            error: 'Duplicate team members',
            message: 'Duplicate team members are not allowed'
          });
        }
      }
    }

    // Validate assignedTo if provided
    if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
      const assignedToIds = req.body.assignedTo.filter(Boolean);
      
      if (assignedToIds.length > 0) {
        const existingUsers = await User.find({ _id: { $in: assignedToIds } });
        const existingUserIds = existingUsers.map(user => user._id.toString());
        const invalidUserIds = assignedToIds.filter(id => !existingUserIds.includes(id));
        
        if (invalidUserIds.length > 0) {
          return res.status(400).json({
            error: 'Invalid assigned users',
            message: `The following user IDs do not exist: ${invalidUserIds.join(', ')}`
          });
        }
      }
    }

    Object.assign(project, req.body);
    project.updatedAt = Date.now();
    await project.save();

    // Create notification for team members
    const teamMembers = project.assignedTo.concat(project.teamMembers.map(tm => tm.user));
    for (const userId of teamMembers) {
      if (userId.toString() !== req.user.id) {
        await Notification.create({
          user: userId,
          type: 'project_update',
          title: 'Project Updated',
          message: `Project "${project.title}" has been updated`,
          relatedId: project._id,
          relatedModel: 'Project'
        });
      }
    }

    await project.populate('createdBy', 'name email');
    await project.populate('assignedTo', 'name email');
    await project.populate('teamMembers.user', 'name email');
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ 
      error: 'Failed to update project',
      message: error.message 
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Not authorized to delete this project' 
      });
    }

    // Delete associated tasks
    const deletedTasks = await Task.deleteMany({ 
      $or: [
        { projectId: project._id.toString() },
        { projectId: project._id },
        { projectId: project.title }
      ]
    });
    
    // Delete project files
    if (project.attachments && project.attachments.length > 0) {
      project.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.path);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (fileError) {
            console.error('Error deleting file:', fileError);
          }
        }
      });
    }

    // Create notifications for team members about project deletion
    const teamMembers = project.assignedTo.concat(project.teamMembers.map(tm => tm.user));
    for (const userId of teamMembers) {
      if (userId.toString() !== req.user.id) {
        await Notification.create({
          user: userId,
          type: 'project_update',
          title: 'Project Deleted',
          message: `Project "${project.title}" has been deleted`,
          relatedId: project._id,
          relatedModel: 'Project'
        });
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Project deleted successfully',
      deletedProject: {
        _id: project._id,
        title: project.title,
        deletedTasks: deletedTasks.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      error: 'Failed to delete project',
      message: error.message 
    });
  }
};

// Upload project document
const uploadProjectDocument = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = {
      filename: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    project.attachments.push(attachment);
    await project.save();

    res.json({ message: 'File uploaded successfully', attachment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project tasks
const getProjectTasks = async (req, res) => {
  try {
    // First, get the project to access both ID and title
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Handle mixed projectId formats - search for both project ID and project title
    const tasks = await Task.find({ 
      $or: [
        { projectId: project._id.toString() },
        { projectId: project._id },
        { projectId: project.title }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch project tasks',
      message: error.message 
    });
  }
};

// Add team member to project
const addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Check if user has permission to add team members
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Not authorized to modify team members for this project' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing user ID',
        message: 'userId is required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with the provided ID' 
      });
    }

    // Check if user is already a team member
    const existingMember = project.teamMembers.find(tm => tm.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ 
        error: 'User already in team',
        message: 'User is already a team member of this project' 
      });
    }

    // Check if user is already assigned to the project
    const isAlreadyAssigned = project.assignedTo.some(id => id.toString() === userId);
    if (isAlreadyAssigned) {
      return res.status(400).json({ 
        error: 'User already assigned',
        message: 'User is already assigned to this project' 
      });
    }

    project.teamMembers.push({ user: userId, role: role || 'member' });
    await project.save();

    // Create notification for the added user
    await Notification.create({
      user: userId,
      type: 'project_update',
      title: 'Added to Project',
      message: `You have been added to project "${project.title}" with role "${role || 'member'}"`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    res.json({ 
      message: 'Team member added successfully',
      addedMember: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        role: role || 'member'
      }
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ 
      error: 'Failed to add team member',
      message: error.message 
    });
  }
};

// Remove team member from project
const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Check if user has permission to remove team members
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Not authorized to modify team members for this project' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with the provided ID' 
      });
    }

    // Check if user is a team member
    const existingMemberIndex = project.teamMembers.findIndex(tm => tm.user.toString() === userId);
    if (existingMemberIndex === -1) {
      return res.status(400).json({ 
        error: 'User not in team',
        message: 'User is not a team member of this project' 
      });
    }

    // Remove the team member
    const removedMember = project.teamMembers.splice(existingMemberIndex, 1)[0];
    await project.save();

    // Create notification for the removed user
    await Notification.create({
      user: userId,
      type: 'project_update',
      title: 'Removed from Project',
      message: `You have been removed from project "${project.title}"`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    res.json({ 
      message: 'Team member removed successfully',
      removedMember: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        role: removedMember.role
      }
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ 
      error: 'Failed to remove team member',
      message: error.message 
    });
  }
};

// Update team member role
const updateTeamMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Check if user has permission to update team members
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Not authorized to modify team members for this project' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No user found with the provided ID' 
      });
    }

    // Check if user is a team member
    const existingMember = project.teamMembers.find(tm => tm.user.toString() === userId);
    if (!existingMember) {
      return res.status(400).json({ 
        error: 'User not in team',
        message: 'User is not a team member of this project' 
      });
    }

    // Update the role
    const oldRole = existingMember.role;
    existingMember.role = role || 'member';
    await project.save();

    // Create notification for the user
    await Notification.create({
      user: userId,
      type: 'project_update',
      title: 'Role Updated',
      message: `Your role in project "${project.title}" has been updated from "${oldRole}" to "${existingMember.role}"`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    res.json({ 
      message: 'Team member role updated successfully',
      updatedMember: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        role: existingMember.role
      }
    });
  } catch (error) {
    console.error('Error updating team member role:', error);
    res.status(500).json({ 
      error: 'Failed to update team member role',
      message: error.message 
    });
  }
};

// Bulk add team members
const addBulkTeamMembers = async (req, res) => {
  try {
    const { teamMembers } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        message: 'No project found with the provided ID' 
      });
    }

    // Check if user has permission to add team members
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Not authorized to modify team members for this project' 
      });
    }

    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'teamMembers must be a non-empty array' 
      });
    }

    // Extract user IDs and validate
    const userIds = teamMembers.map(tm => tm.userId || tm.user).filter(Boolean);
    const roles = teamMembers.map(tm => tm.role || 'member');

    if (userIds.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'No valid user IDs provided' 
      });
    }

    // Check if all users exist
    const existingUsers = await User.find({ _id: { $in: userIds } });
    const existingUserIds = existingUsers.map(user => user._id.toString());
    const invalidUserIds = userIds.filter(id => !existingUserIds.includes(id));
    
    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        error: 'Invalid users',
        message: `The following user IDs do not exist: ${invalidUserIds.join(', ')}`
      });
    }

    // Check for duplicates in request
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length !== userIds.length) {
      return res.status(400).json({
        error: 'Duplicate users',
        message: 'Duplicate users are not allowed in the request'
      });
    }

    // Check for existing team members
    const existingTeamMemberIds = project.teamMembers.map(tm => tm.user.toString());
    const newUserIds = userIds.filter(id => !existingTeamMemberIds.includes(id));
    
    if (newUserIds.length === 0) {
      return res.status(400).json({
        error: 'No new members',
        message: 'All provided users are already team members'
      });
    }

    // Add new team members
    const addedMembers = [];
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const role = roles[i] || 'member';
      
      if (!existingTeamMemberIds.includes(userId)) {
        project.teamMembers.push({ user: userId, role });
        addedMembers.push({ userId, role });
      }
    }

    await project.save();

    // Create notifications for added users
    for (const member of addedMembers) {
      await Notification.create({
        user: member.userId,
        type: 'project_update',
        title: 'Added to Project',
        message: `You have been added to project "${project.title}" with role "${member.role}"`,
        relatedId: project._id,
        relatedModel: 'Project'
      });
    }

    // Get user details for response
    const addedUserDetails = existingUsers.filter(user => 
      addedMembers.some(member => member.userId === user._id.toString())
    ).map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: addedMembers.find(member => member.userId === user._id.toString())?.role || 'member'
    }));

    res.json({ 
      message: `Successfully added ${addedMembers.length} team member(s)`,
      addedMembers: addedUserDetails,
      totalTeamMembers: project.teamMembers.length
    });
  } catch (error) {
    console.error('Error adding bulk team members:', error);
    res.status(500).json({ 
      error: 'Failed to add team members',
      message: error.message 
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectDocument,
  getProjectTasks,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  addBulkTeamMembers,
  upload
};
