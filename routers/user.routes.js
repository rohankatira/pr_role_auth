const express = require('express');
const router = express.Router(); // ← YOU'RE MISSING THIS LINE
const userCtl = require('../controllers/user.controller');
const upload = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public routes
router.get('/login', userCtl.loginPage);
router.post('/login', userCtl.loginUser);
router.get('/signup', userCtl.signupPage);
router.post('/signup', userCtl.signupUser);

// Protected profile routes (apply verifyToken individually)
router.get('/:role/profile', verifyToken, userCtl.profilePage);
router.get('/:role/profile/edit', verifyToken, userCtl.editProfilePage);
router.post('/:role/profile/edit', verifyToken, upload.single('image'), userCtl.updateProfile);
router.post('/:role/profile/delete', verifyToken, userCtl.deleteProfile);

module.exports = router;
