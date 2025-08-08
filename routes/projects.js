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
router.post('/:id/team-members', auth, projectController.addTeamMember);

module.exports = router;
