const express = require('express');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
const Newsletter = require('../models/Newsletter');
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route   POST api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('source', 'Subscription source is required').optional().isIn(['homepage', 'footer', 'checkout', 'profile'])
], async (req, res) => {
  try {
    console.log('Newsletter subscription attempt:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, source = 'homepage' } = req.body;

    // Check if email is already subscribed
    let subscriber = await Newsletter.findOne({ email });
    
    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(200).json({ 
          success: true,
          message: 'You are already subscribed to our newsletter!' 
        });
      } else {
        // Reactivate subscription
        subscriber.isActive = true;
        subscriber.subscribedAt = new Date();
        subscriber.subscriptionSource = source;
        subscriber.unsubscribedAt = undefined;
        await subscriber.save();
        
        console.log(`Reactivated newsletter subscription for: ${email}`);
        
        // Send welcome back email
        try {
          await emailService.sendNewsletterWelcome(subscriber);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
        
        return res.status(200).json({ 
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated.' 
        });
      }
    }

    // Create new subscription
    subscriber = new Newsletter({
      email,
      subscriptionSource: source
    });

    // Generate unsubscribe token
    subscriber.generateUnsubscribeToken();
    
    await subscriber.save();
    console.log(`New newsletter subscription created: ${email} from ${source}`);

    // Send welcome email
    try {
      await emailService.sendNewsletterWelcome(subscriber);
      console.log(`Welcome email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    // Create system notification for admin
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification(
        'newsletter',
        `New newsletter subscriber: ${email}`,
        {
          email,
          source
        }
      );
    } catch (notifyError) {
      console.error('Failed to create admin notification:', notifyError);
    }

    res.status(201).json({ 
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for confirmation.' 
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'This email is already subscribed to our newsletter.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
});

// @route   POST api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', [
  check('token', 'Unsubscribe token is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid unsubscribe token.' 
      });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    console.log(`Newsletter unsubscription: ${subscriber.email}`);

    res.json({ 
      success: true,
      message: 'Successfully unsubscribed from newsletter.' 
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
});

// @route   GET api/newsletter/unsubscribe/:token
// @desc    Unsubscribe via GET link (for email links)
// @access  Public
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2 style="color: #dc3545;">Invalid Unsubscribe Link</h2>
            <p>This unsubscribe link is invalid or has expired.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #007bff;">Return to Homepage</a>
          </body>
        </html>
      `);
    }

    if (!subscriber.isActive) {
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2 style="color: #28a745;">Already Unsubscribed</h2>
            <p>You have already been unsubscribed from our newsletter.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #007bff;">Return to Homepage</a>
          </body>
        </html>
      `);
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    console.log(`Newsletter unsubscription via link: ${subscriber.email}`);

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #28a745;">Successfully Unsubscribed</h2>
          <p>You have been successfully unsubscribed from our newsletter.</p>
          <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #007bff;">Return to Homepage</a>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #dc3545;">Error</h2>
          <p>An error occurred while processing your unsubscribe request.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #007bff;">Return to Homepage</a>
        </body>
      </html>
    `);
  }
});

// ADMIN ROUTES

// @route   GET api/newsletter/admin/subscribers
// @desc    Get all newsletter subscribers (Admin only)
// @access  Private/Admin
router.get('/admin/subscribers', auth, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all'; // 'active', 'inactive', 'all'
    const source = req.query.source || 'all';

    const query = {};

    // Filter by search term
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Filter by status
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Filter by source
    if (source !== 'all') {
      query.subscriptionSource = source;
    }

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Newsletter.countDocuments(query);
    const activeCount = await Newsletter.countDocuments({ isActive: true });
    const totalCount = await Newsletter.countDocuments({});

    res.json({
      subscribers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubscribers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      stats: {
        active: activeCount,
        inactive: totalCount - activeCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/newsletter/admin/subscribers/:id
// @desc    Delete newsletter subscriber (Admin only)
// @access  Private/Admin
router.delete('/admin/subscribers/:id', auth, admin, async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    await Newsletter.findByIdAndDelete(req.params.id);
    
    console.log(`Admin ${req.user.id} deleted newsletter subscriber: ${subscriber.email}`);
    
    res.json({ 
      message: 'Subscriber deleted successfully',
      deletedSubscriber: {
        id: subscriber._id,
        email: subscriber.email,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Delete newsletter subscriber error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/newsletter/admin/subscribers/:id/status
// @desc    Update subscriber status (Admin only)
// @access  Private/Admin
router.put('/admin/subscribers/:id/status', auth, admin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const subscriber = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        ...(isActive === false && { unsubscribedAt: new Date() }),
        ...(isActive === true && { unsubscribedAt: undefined })
      },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    console.log(`Admin ${req.user.id} updated subscriber ${subscriber.email} status to: ${isActive ? 'active' : 'inactive'}`);

    res.json(subscriber);

  } catch (error) {
    console.error('Update subscriber status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/newsletter/admin/stats
// @desc    Get newsletter statistics (Admin only)
// @access  Private/Admin
router.get('/admin/stats', auth, admin, async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ isActive: true });
    const inactiveSubscribers = totalSubscribers - activeSubscribers;
    
    // Subscribers by source
    const sourceStats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$subscriptionSource',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSubscriptions = await Newsletter.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo }
    });

    // Monthly subscription trend (last 6 months)
    const monthlyTrend = await Newsletter.aggregate([
      {
        $match: {
          subscribedAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$subscribedAt' },
            month: { $month: '$subscribedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      overview: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: inactiveSubscribers,
        recentSubscriptions
      },
      sourceBreakdown: sourceStats,
      monthlyTrend
    });

  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
