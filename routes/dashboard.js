const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Protected routes
router.get('/', auth, dashboardController.getDashboardStats);
router.get('/summary', auth, dashboardController.getDashboardSummary);
router.get('/projects-summary', auth, dashboardController.getProjectsSummary);
router.get('/tasks-summary', auth, dashboardController.getTasksSummary);

module.exports = router;
