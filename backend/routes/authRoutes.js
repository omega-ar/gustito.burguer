const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.post('/register', auth, isAdmin, register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;