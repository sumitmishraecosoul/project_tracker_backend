const mongoose = require('mongoose');
const Category = require('../models/Category');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Get all categories for a project
const getProjectCategories = async (req, res) => {
  try {
    const { brandId, projectId } = req.params;

    // Validate projectId is a valid ObjectId
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    // Validate brandId is a valid ObjectId
    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    const categories = await Category.find({
      project_id: projectId,
      brand_id: brandId
    })
      .populate('created_by', 'name email')
      .sort('order');

    // Get task count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const taskCount = await category.getTaskCount();
        return {
          ...category.toObject(),
          taskCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORIES_FETCH_ERROR',
        message: 'Failed to fetch categories',
        details: error.message
      }
    });
  }
};

// Get a single category with its tasks
const getCategoryById = async (req, res) => {
  try {
    const { brandId, projectId, categoryId } = req.params;

    // Validate all IDs are valid ObjectIds
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    if (!categoryId || categoryId === 'undefined' || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY_ID',
          message: 'Invalid category ID provided'
        }
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      project_id: projectId,
      brand_id: brandId
    }).populate('created_by', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    // Get tasks in this category
    const tasks = await category.getTasks();
    const taskCount = tasks.length;

    res.json({
      success: true,
      data: {
        category: category.toObject(),
        tasks,
        taskCount
      },
      message: 'Category details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_FETCH_ERROR',
        message: 'Failed to fetch category',
        details: error.message
      }
    });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { brandId, projectId } = req.params;
    const { name, description, color, order } = req.body;

    // Validate projectId and brandId are valid ObjectIds
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Category name is required'
        }
      });
    }

    // Check if project exists
    const project = await Project.findOne({
      _id: projectId,
      brand_id: brandId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    // Check if category with same name already exists in this project
    // Allow custom categories with same names as defaults, but not duplicate custom categories
    const existingCategory = await Category.findOne({
      project_id: projectId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      is_default: false // Only check for non-default categories
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_EXISTS',
          message: 'A custom category with this name already exists in this project'
        }
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      color,
      order,
      project_id: projectId,
      brand_id: brandId,
      created_by: req.user.id,
      is_default: false
    });

    const populatedCategory = await Category.findById(category._id)
      .populate('created_by', 'name email');

    res.status(201).json({
      success: true,
      data: populatedCategory,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_CREATE_ERROR',
        message: 'Failed to create category',
        details: error.message
      }
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { brandId, projectId, categoryId } = req.params;
    const { name, description, color, order } = req.body;

    // Validate all IDs are valid ObjectIds
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    if (!categoryId || categoryId === 'undefined' || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY_ID',
          message: 'Invalid category ID provided'
        }
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      project_id: projectId,
      brand_id: brandId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        project_id: projectId,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: categoryId },
        is_default: false // Only check for non-default categories
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_EXISTS',
            message: 'A custom category with this name already exists in this project'
          }
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (order !== undefined) category.order = order;

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate('created_by', 'name email');

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_UPDATE_ERROR',
        message: 'Failed to update category',
        details: error.message
      }
    });
  }
};

// Delete a category (and all tasks inside)
const deleteCategory = async (req, res) => {
  try {
    const { brandId, projectId, categoryId } = req.params;

    // Validate all IDs are valid ObjectIds
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    if (!categoryId || categoryId === 'undefined' || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY_ID',
          message: 'Invalid category ID provided'
        }
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      project_id: projectId,
      brand_id: brandId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    // Get task count before deletion
    const taskCount = await Task.countDocuments({ category_id: categoryId });

    // Delete all tasks in this category
    await Task.deleteMany({ category_id: categoryId });

    // Delete the category
    await category.deleteOne();

    res.json({
      success: true,
      data: {
        deletedCategory: category,
        deletedTasksCount: taskCount
      },
      message: `Category deleted successfully. ${taskCount} task(s) were also deleted.`
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_DELETE_ERROR',
        message: 'Failed to delete category',
        details: error.message
      }
    });
  }
};

// Reorder categories (drag & drop)
const reorderCategories = async (req, res) => {
  try {
    const { brandId, projectId } = req.params;
    const { categoryOrders } = req.body;

    // Validate projectId and brandId are valid ObjectIds
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    // Validate input
    if (!Array.isArray(categoryOrders) || categoryOrders.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'categoryOrders must be a non-empty array of {categoryId, order} objects'
        }
      });
    }

    // Validate all categories belong to the project
    const categoryIds = categoryOrders.map(co => co.categoryId);
    const categories = await Category.find({
      _id: { $in: categoryIds },
      project_id: projectId,
      brand_id: brandId
    });

    if (categories.length !== categoryIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORIES',
          message: 'One or more categories do not belong to this project'
        }
      });
    }

    // Reorder categories
    await Category.reorderCategories(categoryOrders);

    // Fetch updated categories
    const updatedCategories = await Category.find({
      project_id: projectId,
      brand_id: brandId
    })
      .populate('created_by', 'name email')
      .sort('order');

    res.json({
      success: true,
      data: updatedCategories,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_REORDER_ERROR',
        message: 'Failed to reorder categories',
        details: error.message
      }
    });
  }
};

// Get all tasks in a category
const getCategoryTasks = async (req, res) => {
  try {
    const { brandId, projectId, categoryId } = req.params;

    // Validate all IDs are valid ObjectIds
    if (!projectId || projectId === 'undefined' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_ID',
          message: 'Invalid project ID provided'
        }
      });
    }

    if (!brandId || brandId === 'undefined' || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BRAND_ID',
          message: 'Invalid brand ID provided'
        }
      });
    }

    if (!categoryId || categoryId === 'undefined' || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY_ID',
          message: 'Invalid category ID provided'
        }
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      project_id: projectId,
      brand_id: brandId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    const tasks = await Task.find({ category_id: categoryId })
      .populate('assignedTo', 'name email')
      .populate('reporter', 'name email')
      .populate('createdBy', 'name email')
      .sort('order');

    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          description: category.description,
          color: category.color
        },
        tasks,
        taskCount: tasks.length
      },
      message: 'Category tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching category tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_TASKS_FETCH_ERROR',
        message: 'Failed to fetch category tasks',
        details: error.message
      }
    });
  }
};

module.exports = {
  getProjectCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryTasks
};


