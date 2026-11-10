const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

// Admin credentials are read from backend/.env. User registration is disabled.
router.post('/login', login);

module.exports = router;
