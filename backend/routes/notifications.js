const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all notifications
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments();
    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasMore: skip + notifications.length < total
      },
      unreadCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private/Admin
router.put('/:id/read', [auth, admin], async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private/Admin
router.put('/mark-all-read', [auth, admin], async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notifications/clear-all
// @desc    Delete all notifications
// @access  Private/Admin
router.delete('/clear-all', [auth, admin], async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ msg: 'All notifications cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete notification
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
