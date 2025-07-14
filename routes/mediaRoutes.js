const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

const MediaController = require('../controllers/mediaController');

// Upload image (original or cropped)
router.post('/upload', upload.single('image'), MediaController.uploadImage);

module.exports = router;
