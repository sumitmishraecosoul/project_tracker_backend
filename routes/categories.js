const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProjectCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryTasks
} = require('../controllers/categoryController');

// All routes require authentication
router.use(auth);

// Get all categories for a project
router.get('/:brandId/projects/:projectId/categories', getProjectCategories);

// Get a specific category with its tasks
router.get('/:brandId/projects/:projectId/categories/:categoryId', getCategoryById);

// Create a new category
router.post('/:brandId/projects/:projectId/categories', createCategory);

// Update a category
router.put('/:brandId/projects/:projectId/categories/:categoryId', updateCategory);

// Delete a category (and all tasks inside)
router.delete('/:brandId/projects/:projectId/categories/:categoryId', deleteCategory);

// Reorder categories (drag & drop)
router.put('/:brandId/projects/:projectId/categories-reorder', reorderCategories);

// Get all tasks in a category
router.get('/:brandId/projects/:projectId/categories/:categoryId/tasks', getCategoryTasks);

module.exports = router;


