const express = require('express');
const router = express.Router();
const brandSubtaskController = require('../controllers/brandSubtaskController');
const auth = require('../middleware/auth');
const { authorize, authorizeBrand } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware subtask routes
// All routes require authentication and brand context

// Get all subtasks for a specific brand
router.get('/:brandId/subtasks', auth, brandContext, brandSubtaskController.getBrandSubtasks);

// Subtask analytics (MUST come before /:id route)
router.get('/:brandId/subtasks/analytics', auth, brandContext, brandSubtaskController.getSubtaskAnalytics);
router.get('/:brandId/tasks/:taskId/subtasks/analytics', auth, brandContext, brandSubtaskController.getTaskSubtaskAnalytics);

// Subtask search and filtering (MUST come before /:id route)
router.get('/:brandId/subtasks/search', auth, brandContext, brandSubtaskController.searchSubtasks);
router.get('/:brandId/subtasks/filter', auth, brandContext, brandSubtaskController.filterSubtasks);

// Get subtask details within a brand (MUST come after specific routes)
router.get('/:brandId/subtasks/:id', auth, brandContext, brandSubtaskController.getBrandSubtaskById);

// Create subtask within a brand (anyone in the brand can create)
router.post('/:brandId/subtasks', auth, brandContext, brandSubtaskController.createBrandSubtask);

// Update subtask within a brand (anyone in the brand can update)
router.put('/:brandId/subtasks/:id', auth, brandContext, brandSubtaskController.updateBrandSubtask);

// Delete subtask within a brand
router.delete('/:brandId/subtasks/:id', auth, brandContext, authorize(['admin', 'manager']), brandSubtaskController.deleteBrandSubtask);

// Get subtasks for a specific task within a brand
router.get('/:brandId/tasks/:taskId/subtasks', auth, brandContext, brandSubtaskController.getBrandTaskSubtasks);

// Subtask assignment management (anyone in the brand can assign)
router.post('/:brandId/subtasks/:id/assign', auth, brandContext, brandSubtaskController.assignSubtask);
router.post('/:brandId/subtasks/:id/unassign', auth, brandContext, brandSubtaskController.unassignSubtask);

// Subtask status management (anyone in the brand can update)
router.put('/:brandId/subtasks/:id/status', auth, brandContext, brandSubtaskController.updateSubtaskStatus);
router.put('/:brandId/subtasks/:id/priority', auth, brandContext, brandSubtaskController.updateSubtaskPriority);

// Subtask organization (anyone in the brand can reorder)
router.put('/:brandId/subtasks/:id/reorder', auth, brandContext, brandSubtaskController.reorderSubtasks);
router.put('/:brandId/tasks/:taskId/subtasks/reorder', auth, brandContext, brandSubtaskController.reorderTaskSubtasks);

// Subtask completion (anyone in the brand can complete)
router.put('/:brandId/subtasks/:id/complete', auth, brandContext, brandSubtaskController.completeSubtask);
router.put('/:brandId/subtasks/:id/uncomplete', auth, brandContext, brandSubtaskController.uncompleteSubtask);

// Subtask templates
router.get('/:brandId/subtask-templates', auth, brandContext, brandSubtaskController.getSubtaskTemplates);
router.get('/:brandId/subtask-templates/:id', auth, brandContext, brandSubtaskController.getSubtaskTemplateById);
router.post('/:brandId/subtask-templates', auth, brandContext, authorize(['admin', 'manager']), brandSubtaskController.createSubtaskTemplate);
router.put('/:brandId/subtask-templates/:id', auth, brandContext, authorize(['admin', 'manager']), brandSubtaskController.updateSubtaskTemplate);
router.delete('/:brandId/subtask-templates/:id', auth, brandContext, authorize(['admin', 'manager']), brandSubtaskController.deleteSubtaskTemplate);

// Apply template to task
router.post('/:brandId/tasks/:taskId/apply-template', auth, brandContext, authorize(['admin', 'manager']), brandSubtaskController.applyTemplateToTask);

// Subtask analytics by ID
router.get('/:brandId/subtasks/:id/analytics', auth, brandContext, brandSubtaskController.getSubtaskAnalyticsById);

module.exports = router;
