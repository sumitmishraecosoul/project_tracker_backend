const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Protected routes - View operations (all authenticated users can view based on their role)
router.get('/', auth, projectController.getAllProjects);
router.get('/:id', auth, projectController.getProjectById);
router.get('/:id/tasks', auth, projectController.getProjectTasks);

// Protected routes - Create operations (managers and admins only)
router.post('/', auth, authorize(['admin', 'manager']), projectController.createProject);

// Protected routes - Update operations (managers and admins only)
router.put('/:id', auth, authorize(['admin', 'manager']), projectController.updateProject);

// Protected routes - Delete operations (managers and admins only)
router.delete('/:id', auth, authorize(['admin', 'manager']), projectController.deleteProject);

// Protected routes - File upload (managers and admins only)
router.post('/:id/upload', auth, authorize(['admin', 'manager']), projectController.upload.single('file'), projectController.uploadProjectDocument);

// Team member management routes (managers and admins only)
router.post('/:id/team-members', auth, authorize(['admin', 'manager']), projectController.addTeamMember);
router.delete('/:id/team-members/:userId', auth, authorize(['admin', 'manager']), projectController.removeTeamMember);
router.put('/:id/team-members/:userId', auth, authorize(['admin', 'manager']), projectController.updateTeamMemberRole);
router.post('/:id/team-members/bulk', auth, authorize(['admin', 'manager']), projectController.addBulkTeamMembers);

module.exports = router;
