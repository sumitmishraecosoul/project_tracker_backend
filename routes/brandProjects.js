const express = require('express');
const router = express.Router();
const brandProjectController = require('../controllers/brandProjectController');
const auth = require('../middleware/auth');
const { authorize, authorizeBrand } = require('../middleware/authorize');
const { brandContext } = require('../middleware/brandContext');

// Brand-aware project routes
// All routes require authentication and brand context

// Get all projects for a specific brand
router.get('/:brandId/projects', auth, brandContext, brandProjectController.getBrandProjects);

// Get project details within a brand
router.get('/:brandId/projects/:id', auth, brandContext, brandProjectController.getBrandProjectById);

// Create project within a brand
router.post('/:brandId/projects', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.createBrandProject);

// Update project within a brand
router.put('/:brandId/projects/:id', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.updateBrandProject);

// Delete project within a brand
router.delete('/:brandId/projects/:id', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.deleteBrandProject);

// Get project tasks within a brand
router.get('/:brandId/projects/:id/tasks', auth, brandContext, brandProjectController.getBrandProjectTasks);

// Project status management
router.put('/:brandId/projects/:id/status', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.updateProjectStatus);

// Project completion tracking
router.put('/:brandId/projects/:id/complete', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.completeProject);

// Project archiving
router.put('/:brandId/projects/:id/archive', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.archiveProject);

// Project sections management
router.get('/:brandId/projects/:id/sections', auth, brandContext, brandProjectController.getProjectSections);
router.post('/:brandId/projects/:id/sections', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.createProjectSection);
router.put('/:brandId/sections/:sectionId', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.updateProjectSection);
router.delete('/:brandId/sections/:sectionId', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.deleteProjectSection);

// Project views
router.get('/:brandId/projects/:id/views', auth, brandContext, brandProjectController.getProjectViews);
router.post('/:brandId/projects/:id/views', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.createProjectView);
router.put('/:brandId/views/:viewId', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.updateProjectView);
router.delete('/:brandId/views/:viewId', auth, brandContext, authorizeBrand(['owner', 'admin', 'manager']), brandProjectController.deleteProjectView);

// Project analytics
router.get('/:brandId/projects/:id/analytics', auth, brandContext, brandProjectController.getProjectAnalytics);
router.get('/:brandId/projects/:id/progress', auth, brandContext, brandProjectController.getProjectProgress);

module.exports = router;
