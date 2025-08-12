const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/:id/tasks', projectController.getProjectTasks);

// Protected routes
router.post('/', auth, projectController.createProject);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);
router.post('/:id/upload', auth, projectController.upload.single('file'), projectController.uploadProjectDocument);

// Team member management routes
router.post('/:id/team-members', auth, projectController.addTeamMember);
router.delete('/:id/team-members/:userId', auth, projectController.removeTeamMember);
router.put('/:id/team-members/:userId', auth, projectController.updateTeamMemberRole);
router.post('/:id/team-members/bulk', auth, projectController.addBulkTeamMembers);

module.exports = router;
