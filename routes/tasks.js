const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// View operations (all authenticated users can view based on their role)
router.get('/', auth, getAllTasks);
router.get('/:id', auth, getTaskById);

// Create operations (all authenticated users can create tasks)
router.post('/', auth, createTask);

// Update operations (all authenticated users can update their own tasks)
router.put('/:id', auth, updateTask);

// Delete operations (all authenticated users can delete their own tasks)
router.delete('/:id', auth, deleteTask);

module.exports = router;
