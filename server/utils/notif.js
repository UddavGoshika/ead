const Notification = require('../models/Notification');

/**
 * Creates and saves a notification to the database.
 * @param {string} type - The type of notification (e.g., 'registration', 'blog')
 * @param {string} message - The content of the notification
 * @param {string} senderName - Name of the user performing the action
 * @param {string} senderId - ID of the user performing the action
 * @param {Object} metadata - Optional extra data
 */
const createNotification = async (type, message, senderName = '', senderId = null, metadata = {}) => {
    try {
        const notif = new Notification({
            type,
            message,
            senderName,
            senderId,
            metadata
        });
        await notif.save();
        console.log(`[Notification] Created: ${type} - ${message}`);
    } catch (err) {
        console.error(`[Notification] Failed to create: ${err.message}`);
    }
};

module.exports = { createNotification };
