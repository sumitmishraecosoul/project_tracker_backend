const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.post('/', auth, createUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;
