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

router.get('/', auth, getAllTasks);
router.get('/:id', auth, getTaskById);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
