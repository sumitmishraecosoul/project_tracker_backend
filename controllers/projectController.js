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
    const projectData = {
      ...req.body,
      createdBy: req.user.id
    };

    const project = new Project(projectData);
    await project.save();

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'project_update',
      title: 'New Project Created',
      message: `Project "${project.title}" has been created`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await project.populate('createdBy', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to update
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
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
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete associated tasks
    await Task.deleteMany({ projectId: project._id });
    
    // Delete project files
    if (project.attachments && project.attachments.length > 0) {
      const fs = require('fs');
      project.attachments.forEach(attachment => {
        const filePath = path.join(__dirname, '..', attachment.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Project not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a team member
    const existingMember = project.teamMembers.find(tm => tm.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.teamMembers.push({ user: userId, role: role || 'member' });
    await project.save();

    // Create notification for the added user
    await Notification.create({
      user: userId,
      type: 'project_update',
      title: 'Added to Project',
      message: `You have been added to project "${project.title}"`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    res.json({ message: 'Team member added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  upload
};
