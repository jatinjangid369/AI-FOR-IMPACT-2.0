const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, verifyOtp } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
