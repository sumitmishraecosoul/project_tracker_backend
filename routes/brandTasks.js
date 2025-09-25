const express = require('express');
const router = express.Router();
const brandTaskController = require('../controllers/brandTaskController');
const auth = require('../middleware/auth');
const { authorize, authorizeBrand } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware task routes
// All routes require authentication and brand context

// Get all tasks for a specific brand
router.get('/:brandId/tasks', auth, brandContext, brandTaskController.getBrandTasks);

// Create task within a brand
router.post('/:brandId/tasks', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager', 'employee']), brandTaskController.createBrandTask);

// Get tasks for a specific project within a brand
router.get('/:brandId/projects/:projectId/tasks', auth, brandContext, brandTaskController.getBrandProjectTasks);

// Task sections management
router.get('/:brandId/projects/:projectId/sections', auth, brandContext, brandTaskController.getTaskSections);
router.post('/:brandId/projects/:projectId/sections', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.createTaskSection);
router.put('/:brandId/sections/:sectionId', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.updateTaskSection);
router.delete('/:brandId/sections/:sectionId', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.deleteTaskSection);

// Task status workflow management
router.get('/:brandId/tasks/status-workflow', auth, brandContext, brandTaskController.getStatusWorkflow);
router.put('/:brandId/tasks/status-workflow', auth, brandContext, authorize(['admin']), brandTaskController.updateStatusWorkflow);

// Task priority management
router.get('/:brandId/tasks/priority-system', auth, brandContext, brandTaskController.getPrioritySystem);
router.put('/:brandId/tasks/priority-system', auth, brandContext, authorize(['admin']), brandTaskController.updatePrioritySystem);

// Task analytics (MUST come before /:id route)
router.get('/:brandId/tasks/analytics', auth, brandContext, brandTaskController.getTaskAnalytics);

// Task search and filtering (MUST come before /:id route)
router.get('/:brandId/tasks/search', auth, brandContext, brandTaskController.searchTasks);
router.get('/:brandId/tasks/filter', auth, brandContext, brandTaskController.filterTasks);

// Get task details within a brand (MUST come after specific routes)
router.get('/:brandId/tasks/:id', auth, brandContext, brandTaskController.getBrandTaskById);

// Update task within a brand
router.put('/:brandId/tasks/:id', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandTaskController.updateBrandTask);

// Delete task within a brand
router.delete('/:brandId/tasks/:id', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.deleteBrandTask);

// Task assignment management
router.post('/:brandId/tasks/:id/assign', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.assignTask);
router.post('/:brandId/tasks/:id/unassign', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.unassignTask);

// Task status management
router.put('/:brandId/tasks/:id/status', auth, brandContext, authorize(['admin', 'manager', 'employee']), brandTaskController.updateTaskStatus);
router.put('/:brandId/tasks/:id/priority', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.updateTaskPriority);

// Task dependencies management
router.get('/:brandId/tasks/:id/dependencies', auth, brandContext, brandTaskController.getTaskDependencies);
router.post('/:brandId/tasks/:id/dependencies', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.addTaskDependency);
router.delete('/:brandId/tasks/:id/dependencies/:dependencyId', auth, brandContext, authorize(['admin', 'manager']), brandTaskController.removeTaskDependency);

// Task analytics by ID
router.get('/:brandId/tasks/:id/analytics', auth, brandContext, brandTaskController.getTaskAnalyticsById);

module.exports = router;
