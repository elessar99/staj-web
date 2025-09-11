const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (to, content, type = 'info', isHtml=false) => {
    try {
        const notification = new Notification({ to, content, type, isHtml });
        await notification.save();
        return notification;
    } catch (error) {
        throw new Error('Notification creation failed: ' + error.message);
    }
};

const createNotifications = async (toList, content, type= "info" , isHtml=false) => {
    try {
        const notifications = toList.map(to => ({
            to,
            content,
            type,
            isHtml
        }));
        await Notification.insertMany(notifications);
        return notifications;
    } catch (error) {
        throw new Error('Notifications creation failed: ' + error.message);
    }
};

const getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await Notification.find({ to: userId }).sort({ timestamp: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications: ' + error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read: ' + error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notification: ' + error.message });
    }  
};


module.exports = {
    createNotification,
    createNotifications,
    getNotificationsForUser,
    markAsRead,
    deleteNotification
};