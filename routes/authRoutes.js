const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const jwt = require('jsonwebtoken');

router.get('/signup', (req, res) => {
      if (req.cookies.token) {
            const token = req.cookies.token;
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).redirect('/auth/signin');
                }
                let user = decoded;
                return res.render('auth/signup', { title: "Sign up", user });
            });
        } else {
            return res.render('auth/signup', { title: "Sign up", user: null });
        }
});

router.get('/signin', (req, res) => {
    if (req.cookies.token) {
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).redirect('/auth/signin');
            }
            let user = decoded;
            return res.render('auth/signin', { title: "Sign in", user });
        });
    } else {
        return res.render('auth/signin', { title: "Sign in", user: null });
    }
});

router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', { title: "Forgot Password", user: null });
});

router.get('/reset-password/:token', authController.resetPassword);

router.post('/signup',upload.single('image'),authController.signup);
router.post('/signin', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.updatePassword);
router.get('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;