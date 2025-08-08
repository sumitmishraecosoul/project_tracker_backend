const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', dashboardController.getDashboardStats);
router.get('/projects-summary', dashboardController.getProjectsSummary);
router.get('/tasks-summary', dashboardController.getTasksSummary);

module.exports = router;
