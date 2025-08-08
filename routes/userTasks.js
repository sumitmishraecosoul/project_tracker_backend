const express = require('express');
const router = express.Router();
const userTaskController = require('../controllers/userTaskController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', userTaskController.getAllUserTasks);
router.get('/:id', userTaskController.getUserTaskById);
router.get('/user/:userId', userTaskController.getUserTasksByUserId);
router.get('/date/:date', userTaskController.getUserTasksByDate);

// Protected routes
router.post('/', auth, userTaskController.createUserTask);
router.put('/:id', auth, userTaskController.updateUserTask);
router.delete('/:id', auth, userTaskController.deleteUserTask);

module.exports = router;
