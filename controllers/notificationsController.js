const Notification = require('../models/Notification');

const notificationsController = {};

notificationsController.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const result = await Notification.markNotificationAsRead(notificationId);
        if (result) {
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ error: 'Notification not found' });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = notificationsController;