const express = require('express');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Contact = require('../models/Contact');
const Order = require('../models/Order');
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Rate limiting for contact form submissions
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many contact form submissions, please try again later.'
  }
});

// @route    POST api/contact
// @desc     Submit contact form
// @access   Public
router.post('/', [
  contactLimiter,
  [
    check('name', 'Name is required and must be between 2-100 characters')
      .isLength({ min: 2, max: 100 })
      .trim()
      .escape(),
    check('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail(),
    check('subject', 'Subject is required')
      .isIn(['general', 'support', 'order', 'return', 'feedback', 'other'])
      .withMessage('Invalid subject selected'),
    check('message', 'Message is required and must be between 10-1000 characters')
      .isLength({ min: 10, max: 1000 })
      .trim()
      .escape(),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please enter a valid phone number'),
    check('orderNumber')
      .optional()
      .isMongoId()
      .withMessage('Invalid order number format')
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, subject, message, phone, orderNumber } = req.body;

  try {
    // If order number is provided, verify it exists
    if (orderNumber) {
      const orderExists = await Order.findById(orderNumber);
      if (!orderExists) {
        return res.status(400).json({
          errors: [{ msg: 'Order number not found' }]
        });
      }
    }

    // Get client IP and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Create contact submission
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      phone,
      orderNumber,
      ipAddress,
      userAgent
    });

    await contact.save();

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmation(contact);
    } catch (emailError) {
      console.error('Failed to send contact confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendContactNotification(contact);
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      ticketId: contact._id
    });

  } catch (err) {
    console.error('Contact form submission error:', err);
    res.status(500).json({
      error: 'Server Error',
      message: 'Something went wrong. Please try again later.'
    });
  }
});

// @route    GET api/contact/my-tickets
// @desc     Get all tickets for the logged-in user
// @access   Private
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const user = await req.user; // Get user from auth middleware
    // Find tickets where email matches user's email
    const tickets = await Contact.find({ email: user.email })
      .sort({ createdAt: -1 })
      .select('-ipAddress -userAgent'); // Exclude sensitive info

    res.json(tickets);
  } catch (err) {
    console.error('Get my tickets error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    GET api/contact/my-tickets/:id
// @desc     Get single ticket for the logged-in user
// @access   Private
router.get('/my-tickets/:id', auth, async (req, res) => {
  try {
    const user = await req.user;
    const ticket = await Contact.findById(req.params.id)
      .populate('response.respondedBy', 'name');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if ticket belongs to user
    if (ticket.email !== user.email) {
      return res.status(403).json({ msg: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } catch (err) {
    console.error('Get my ticket error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    PUT api/contact/my-tickets/:id/close
// @desc     Allow user to close their own ticket
// @access   Private
router.put('/my-tickets/:id/close', auth, async (req, res) => {
  try {
    const user = await req.user;
    const ticket = await Contact.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if ticket belongs to user
    if (ticket.email !== user.email) {
      return res.status(403).json({ msg: 'Not authorized to manage this ticket' });
    }

    if (ticket.status === 'closed') {
       return res.status(400).json({ msg: 'Ticket is already closed' });
    }

    ticket.status = 'closed';
    await ticket.save();

    res.json({ msg: 'Ticket closed successfully', ticket });

  } catch (err) {
    console.error('Close my ticket error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    DELETE api/contact/my-tickets/:id
// @desc     Allow user to delete their own ticket
// @access   Private
router.delete('/my-tickets/:id', auth, async (req, res) => {
  try {
    const user = await req.user;
    const ticket = await Contact.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check if ticket belongs to user
    if (ticket.email !== user.email) {
      return res.status(403).json({ msg: 'Not authorized to delete this ticket' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Ticket deleted successfully' });

  } catch (err) {
    console.error('Delete my ticket error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    GET api/contact
// @desc     Get all contact submissions (admin only)
// @access   Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;
    const subject = req.query.subject;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name email')
      .populate('response.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalContacts = await Contact.countDocuments(filter);

    res.json({
      contacts,
      totalPages: Math.ceil(totalContacts / limit),
      currentPage: page,
      totalContacts
    });

  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    GET api/contact/stats
// @desc     Get contact statistics (admin only)
// @access   Private/Admin
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const pendingContacts = await Contact.countDocuments({ status: 'pending' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });

    // Get contacts by subject
    const contactsBySubject = await Contact.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get contacts by priority
    const contactsByPriority = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent contacts (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get average response time for resolved contacts
    const avgResponseTime = await Contact.aggregate([
      {
        $match: { 
          status: 'resolved',
          'response.respondedAt': { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: ['$response.respondedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    res.json({
      totalContacts,
      pendingContacts,
      resolvedContacts,
      recentContacts,
      contactsBySubject,
      contactsByPriority,
      avgResponseTimeHours: avgResponseTime.length > 0 
        ? Math.round(avgResponseTime[0].avgTime / (1000 * 60 * 60))
        : 0
    });

  } catch (err) {
    console.error('Get contact stats error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    GET api/contact/:id
// @desc     Get single contact submission (admin only)
// @access   Private/Admin
router.get('/:id', [auth, admin], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('response.respondedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }

    res.json(contact);

  } catch (err) {
    console.error('Get contact error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    PUT api/contact/:id/status
// @desc     Update contact status (admin only)
// @access   Private/Admin
router.put('/:id/status', [
  auth,
  admin,
  [
    check('status', 'Status is required')
      .isIn(['pending', 'in-progress', 'resolved', 'closed'])
      .withMessage('Invalid status')
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }

    contact.status = status;
    if (status === 'in-progress') {
      contact.assignedTo = req.user.id;
    }

    await contact.save();

    res.json({ msg: 'Contact status updated successfully', contact });

  } catch (err) {
    console.error('Update contact status error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    PUT api/contact/:id/respond
// @desc     Respond to contact submission (admin only)
// @access   Private/Admin
router.put('/:id/respond', [
  auth,
  admin,
  [
    check('message', 'Response message is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Response must be between 10-1000 characters')
      .trim()
      .escape()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { message } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }

    // Mark as resolved with response
    await contact.markAsResolved(req.user.id, message);

    // Send response email to user
    try {
      await emailService.sendContactResponse(contact, message);
    } catch (emailError) {
      console.error('Failed to send contact response email:', emailError);
    }

    res.json({ 
      msg: 'Response sent successfully', 
      contact: await Contact.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('response.respondedBy', 'name email')
    });

  } catch (err) {
    console.error('Respond to contact error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    DELETE api/contact/:id
// @desc     Delete contact submission (admin only)
// @access   Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Contact submission deleted successfully' });

  } catch (err) {
    console.error('Delete contact error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Contact submission not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
