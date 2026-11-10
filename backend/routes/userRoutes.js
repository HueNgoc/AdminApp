const express = require('express');
const requireAuth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const { listUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();
router.use(requireAuth);
router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', uploadImage, createUser);
router.put('/:id', uploadImage, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
