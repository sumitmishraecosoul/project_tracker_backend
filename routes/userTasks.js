const express = require('express');
const router = express.Router();
const userTaskController = require('../controllers/userTaskController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', userTaskController.getAllUserTasks);
router.get('/user/:userId', userTaskController.getUserTasksByUserId);
router.get('/user/:userId/summary', userTaskController.getUserTaskSummary);
router.get('/date/:date', userTaskController.getUserTasksByDate);
router.get('/:id', userTaskController.getUserTaskById);

// Protected routes
router.post('/', auth, userTaskController.createUserTask);
router.put('/:id', auth, userTaskController.updateUserTask);
router.delete('/:id', auth, userTaskController.deleteUserTask);

module.exports = router;
