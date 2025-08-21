const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAssignableUsers,
  getMyTeam
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Helper endpoints should be declared BEFORE dynamic :id route
router.get('/helpers/assignable-users', auth, getAssignableUsers);
router.get('/helpers/my-team', auth, getMyTeam);

router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.post('/', auth, createUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;
