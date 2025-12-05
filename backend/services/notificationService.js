const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const emailService = require('./emailService');

const createNotification = async (type, message, data = {}) => {
  try {
    const settings = await Setting.getSettings();
    const notifications = settings.notifications;

    let shouldNotify = false;

    switch (type) {
      case 'order':
        shouldNotify = notifications.orderNotifications;
        break;
      case 'user':
        shouldNotify = notifications.userRegistrations;
        break;
      case 'stock':
        shouldNotify = notifications.lowStockAlerts;
        break;
      case 'newsletter':
        shouldNotify = notifications.newsletterUpdates;
        break;
      case 'system':
        shouldNotify = true; // System notifications are always saved
        break;
      default:
        shouldNotify = true;
    }

    if (shouldNotify) {
      const notification = await Notification.create({
        type,
        message,
        data
      });

      // Check if email notification is enabled and needed
      if (notifications.emailNotifications) {
        // Logic to send email based on type
        // For now, we'll just log it, or you can integrate emailService here
        // Example: if (type === 'order') emailService.sendOrderNotification(...)
        console.log(`[Notification Service] Email would be sent for: ${type} - ${message}`);
      }

      return notification;
    }

    return null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createNotification
};
