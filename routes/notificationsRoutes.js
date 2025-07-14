const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const authenticate = require('../middlware/authenticate');

router.use(authenticate);

router.put('/:id/mark_as_read', notificationsController.markNotificationAsRead);

module.exports = router;