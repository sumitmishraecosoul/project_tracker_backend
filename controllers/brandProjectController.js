const mongoose = require('mongoose');
const Project = require('../models/Project');
const ProjectSection = require('../models/ProjectSection');
const ProjectView = require('../models/ProjectView');
const Task = require('../models/Task');
const User = require('../models/User');
const Category = require('../models/Category');

// Get all projects for a specific brand
const getBrandProjects = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { page = 1, limit = 10, status, department, search } = req.query;

    // Build query with brand filter
    let query = { brand_id: brandId };

    // Apply additional filters
    if (status) {
      query.status = status;
    }
    if (department) {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects with pagination
    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('teamMembers.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProjects = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProjects / parseInt(limit)),
          totalProjects,
          hasNextPage: skip + projects.length < totalProjects,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: 'Brand projects retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECTS_FETCH_ERROR',
        message: 'Failed to fetch brand projects',
        details: error.message
      }
    });
  }
};

// Get project details within a brand
const getBrandProjectById = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const project = await Project.findOne({ _id: id, brand_id: brandId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('teamMembers.user', 'name email')
      .populate('brand', 'name slug');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    // Get project sections
    const sections = await ProjectSection.getSectionsByProject(id, brandId);

    // Get project views
    const views = await ProjectView.getViewsByProject(id, brandId, req.user.id);

    res.json({
      success: true,
      data: {
        project,
        sections,
        views
      },
      message: 'Brand project details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand project details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECT_FETCH_ERROR',
        message: 'Failed to fetch brand project details',
        details: error.message
      }
    });
  }
};

// Create project within a brand
const createBrandProject = async (req, res) => {
  try {
    const { brandId } = req.params;
    const projectData = {
      ...req.body,
      brand_id: brandId,
      createdBy: req.user.id
    };

    // Validate required fields
    if (!projectData.title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project title is required'
        }
      });
    }

    // Create project
    const project = await Project.create(projectData);

    // Auto-create 3 default categories for the project
    try {
      await Category.createDefaultCategories(project._id, brandId, req.user.id);
    } catch (categoryError) {
      console.error('Error creating default categories:', categoryError);
      // Continue even if category creation fails - we don't want to fail the project creation
    }

    // Populate the created project
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('teamMembers.user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedProject,
      message: 'Brand project created successfully'
    });
  } catch (error) {
    console.error('Error creating brand project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECT_CREATE_ERROR',
        message: 'Failed to create brand project',
        details: error.message
      }
    });
  }
};

// Update project within a brand
const updateBrandProject = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const project = await Project.findOne({ _id: id, brand_id: brandId });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email')
     .populate('teamMembers.user', 'name email');

    res.json({
      success: true,
      data: updatedProject,
      message: 'Brand project updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECT_UPDATE_ERROR',
        message: 'Failed to update brand project',
        details: error.message
      }
    });
  }
};

// Delete project within a brand
const deleteBrandProject = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const project = await Project.findOne({ _id: id, brand_id: brandId });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    // Delete associated tasks
    await Task.deleteMany({ projectId: id, brand_id: brandId });

    // Delete associated sections
    await ProjectSection.deleteMany({ project_id: id, brand_id: brandId });

    // Delete associated views
    await ProjectView.deleteMany({ project_id: id, brand_id: brandId });

    // Delete project
    await Project.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Brand project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECT_DELETE_ERROR',
        message: 'Failed to delete brand project',
        details: error.message
      }
    });
  }
};

// Get project tasks within a brand
const getBrandProjectTasks = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { status, priority, assignedTo } = req.query;

    let query = { projectId: id, brand_id: brandId };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
      message: 'Brand project tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching brand project tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRAND_PROJECT_TASKS_FETCH_ERROR',
        message: 'Failed to fetch brand project tasks',
        details: error.message
      }
    });
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        }
      });
    }

    const validStatuses = ['Active', 'Completed', 'On Hold', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        }
      });
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project status updated successfully'
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_STATUS_UPDATE_ERROR',
        message: 'Failed to update project status',
        details: error.message
      }
    });
  }
};

// Complete project
const completeProject = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const project = await Project.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { 
        status: 'Completed',
        progress: 100,
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project completed successfully'
    });
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_COMPLETE_ERROR',
        message: 'Failed to complete project',
        details: error.message
      }
    });
  }
};

// Archive project
const archiveProject = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const project = await Project.findOneAndUpdate(
      { _id: id, brand_id: brandId },
      { 
        status: 'Archived',
        archivedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project archived successfully'
    });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_ARCHIVE_ERROR',
        message: 'Failed to archive project',
        details: error.message
      }
    });
  }
};

// Project sections management
const getProjectSections = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const sections = await ProjectSection.getSectionsByProject(id, brandId);

    res.json({
      success: true,
      data: sections,
      message: 'Project sections retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching project sections:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_SECTIONS_FETCH_ERROR',
        message: 'Failed to fetch project sections',
        details: error.message
      }
    });
  }
};

const createProjectSection = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Section name is required'
        }
      });
    }

    const section = await ProjectSection.create({
      brand_id: brandId,
      project_id: id,
      name,
      description,
      color,
      icon,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: section,
      message: 'Project section created successfully'
    });
  } catch (error) {
    console.error('Error creating project section:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_SECTION_CREATE_ERROR',
        message: 'Failed to create project section',
        details: error.message
      }
    });
  }
};

const updateProjectSection = async (req, res) => {
  try {
    const { brandId, sectionId } = req.params;

    const section = await ProjectSection.findOneAndUpdate(
      { _id: sectionId, brand_id: brandId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SECTION_NOT_FOUND',
          message: 'Section not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: section,
      message: 'Project section updated successfully'
    });
  } catch (error) {
    console.error('Error updating project section:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_SECTION_UPDATE_ERROR',
        message: 'Failed to update project section',
        details: error.message
      }
    });
  }
};

const deleteProjectSection = async (req, res) => {
  try {
    const { brandId, sectionId } = req.params;

    const section = await ProjectSection.findOneAndDelete({
      _id: sectionId,
      brand_id: brandId
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SECTION_NOT_FOUND',
          message: 'Section not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      message: 'Project section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project section:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_SECTION_DELETE_ERROR',
        message: 'Failed to delete project section',
        details: error.message
      }
    });
  }
};

// Project views management
const getProjectViews = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const views = await ProjectView.getViewsByProject(id, brandId, req.user.id);

    res.json({
      success: true,
      data: views,
      message: 'Project views retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching project views:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_VIEWS_FETCH_ERROR',
        message: 'Failed to fetch project views',
        details: error.message
      }
    });
  }
};

const createProjectView = async (req, res) => {
  try {
    const { brandId, id } = req.params;
    const { name, type, description, settings, is_default } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'View name and type are required'
        }
      });
    }

    const view = await ProjectView.create({
      brand_id: brandId,
      project_id: id,
      name,
      type,
      description,
      settings,
      is_default,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: view,
      message: 'Project view created successfully'
    });
  } catch (error) {
    console.error('Error creating project view:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_VIEW_CREATE_ERROR',
        message: 'Failed to create project view',
        details: error.message
      }
    });
  }
};

const updateProjectView = async (req, res) => {
  try {
    const { brandId, viewId } = req.params;

    const view = await ProjectView.findOneAndUpdate(
      { _id: viewId, brand_id: brandId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!view) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VIEW_NOT_FOUND',
          message: 'View not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      data: view,
      message: 'Project view updated successfully'
    });
  } catch (error) {
    console.error('Error updating project view:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_VIEW_UPDATE_ERROR',
        message: 'Failed to update project view',
        details: error.message
      }
    });
  }
};

const deleteProjectView = async (req, res) => {
  try {
    const { brandId, viewId } = req.params;

    const view = await ProjectView.findOneAndDelete({
      _id: viewId,
      brand_id: brandId
    });

    if (!view) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VIEW_NOT_FOUND',
          message: 'View not found in this brand'
        }
      });
    }

    res.json({
      success: true,
      message: 'Project view deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project view:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_VIEW_DELETE_ERROR',
        message: 'Failed to delete project view',
        details: error.message
      }
    });
  }
};

// Project analytics
const getProjectAnalytics = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    // Get project details
    const project = await Project.findOne({ _id: id, brand_id: brandId });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { projectId: id, brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get progress over time
    const progressData = await Task.aggregate([
      { $match: { projectId: id, brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          tasksCreated: { $sum: 1 },
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get team performance
    const teamPerformance = await Task.aggregate([
      { $match: { projectId: id, brand_id: new mongoose.Types.ObjectId(brandId) } },
      {
        $group: {
          _id: '$assignedTo',
          tasksAssigned: { $sum: 1 },
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          title: project.title,
          status: project.status,
          progress: project.progress
        },
        taskStatistics: taskStats,
        progressData,
        teamPerformance
      },
      message: 'Project analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch project analytics',
        details: error.message
      }
    });
  }
};

const getProjectProgress = async (req, res) => {
  try {
    const { brandId, id } = req.params;

    const project = await Project.findOne({ _id: id, brand_id: brandId });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found in this brand'
        }
      });
    }

    // Calculate progress based on completed tasks
    const totalTasks = await Task.countDocuments({ projectId: id, brand_id: brandId });
    const completedTasks = await Task.countDocuments({ 
      projectId: id, 
      brand_id: brandId, 
      status: 'Completed' 
    });

    const calculatedProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Update project progress if different
    if (Math.abs(project.progress - calculatedProgress) > 1) {
      await Project.findByIdAndUpdate(id, { progress: calculatedProgress });
    }

    res.json({
      success: true,
      data: {
        projectId: id,
        totalTasks,
        completedTasks,
        progress: calculatedProgress,
        remainingTasks: totalTasks - completedTasks
      },
      message: 'Project progress retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching project progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROJECT_PROGRESS_FETCH_ERROR',
        message: 'Failed to fetch project progress',
        details: error.message
      }
    });
  }
};

module.exports = {
  getBrandProjects,
  getBrandProjectById,
  createBrandProject,
  updateBrandProject,
  deleteBrandProject,
  getBrandProjectTasks,
  updateProjectStatus,
  completeProject,
  archiveProject,
  getProjectSections,
  createProjectSection,
  updateProjectSection,
  deleteProjectSection,
  getProjectViews,
  createProjectView,
  updateProjectView,
  deleteProjectView,
  getProjectAnalytics,
  getProjectProgress
};
