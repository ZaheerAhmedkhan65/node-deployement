const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middlware/upload');
const jwt = require('jsonwebtoken');

router.get('/signup', (req, res) => {
      if (req.cookies.token) {
            const token = req.cookies.token;
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).redirect('/auth/signin');
                }
                let user = decoded;
                console.log(user.userId);
                return res.render('signup', { title: "Sign up", user });
            });
        } else {
            console.log("no token");
            return res.render('signup', { title: "Sign up", user: null });
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
            console.log(user.userId);
            return res.render('signin', { title: "Sign in", user });
        });
    } else {
        console.log("no token");
        return res.render('signin', { title: "Sign in", user: null });
    }
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: "Forgot Password", user: null });
});

router.get('/reset-password/:token', authController.resetPassword);

router.post('/signup',upload.single('image'),authController.signup);
router.post('/signin', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.updatePassword);
router.get('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;