const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/signup', (req, res) => {
    res.render('signup', { title: "Sign up", user: req.session.user || null });
});

router.get('/signin', (req, res) => {
    res.render('signin', { title: "Sign in", user: req.session.user || null });
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: "Forgot Password", user: req.session.user || null });
});

router.get('/reset-password/:token', authController.resetPassword);

router.post('/signup', authController.signup);
router.post('/signin', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.updatePassword);
router.get('/logout', authController.logout);

module.exports = router;