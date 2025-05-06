const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlware/upload');
const authenticate = require('../middlware/authenticate');

router.get('/:id/profile',authenticate, userController.profile);
router.post('/:id/avatar/update',authenticate,upload.single('image'), userController.updateProfile);
module.exports = router;