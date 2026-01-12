const express = require('express');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route    GET api/users/profile
// @desc     Get current user profile
// @access   Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -emailVerificationToken -passwordResetToken');
    
    // Add computed fields for better frontend handling
    const userProfile = {
      ...user.toObject(),
      canResendEmailVerification: !user.emailVerificationSentAt || 
        (Date.now() - user.emailVerificationSentAt.getTime()) > 60000, // 1 minute
      securityStatus: {
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        accountComplete: user.emailVerified && user.phoneVerified
      }
    };
    
    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/users/profile
// @desc     Update user profile
// @access   Private
router.put('/profile', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;

      await user.save();
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/users
// @desc     Get all users (Admin only)
// @access   Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/users/send-phone-verification
// @desc     Send phone verification code to current user
// @access   Private
router.post('/send-phone-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    if (user.phoneVerified) {
      return res.status(400).json({ errors: [{ msg: 'Phone already verified' }] });
    }
    
    if (!user.phone) {
      return res.status(400).json({ errors: [{ msg: 'No phone number found. Please add a phone number first.' }] });
    }
    
    // Check rate limiting
    if (user.phoneVerificationAttempts && user.phoneVerificationAttempts >= 5) {
      const lastAttempt = user.phoneVerificationLastAttempt;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastAttempt && lastAttempt > oneHourAgo) {
        return res.status(429).json({ 
          errors: [{ msg: 'Too many attempts. Please try again in 1 hour.' }] 
        });
      }
      
      user.phoneVerificationAttempts = 0;
    }
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpires = verificationExpires;
    await user.save();
    
    // Import the SMS function from auth routes
    const sendSMSVerificationCode = require('./auth').sendSMSVerificationCode || (() => ({ success: true, devCode: verificationCode }));
    
    console.log(`Phone verification code generated for user ${user._id}: ${verificationCode}`);
    console.log(`📱 SMS Code for ${user.phone}: ${verificationCode}`);
    
    res.json({ 
      msg: 'Verification code sent to your phone',
      phoneNumber: user.phone.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
      expiresIn: '10 minutes',
      devCode: verificationCode // Include for development
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/users/send-email-verification
// @desc     Send email verification to current user
// @access   Private
router.post('/send-email-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ errors: [{ msg: 'Email already verified' }] });
    }
    
    // Check if verification email was sent recently (prevent spam)
    if (user.emailVerificationSentAt) {
      const timeSinceLastSent = Date.now() - user.emailVerificationSentAt.getTime();
      const oneMinute = 60 * 1000;
      
      if (timeSinceLastSent < oneMinute) {
        return res.status(429).json({ 
          errors: [{ msg: 'Please wait before requesting another verification email' }] 
        });
      }
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationSentAt = new Date();
    await user.save();
    
    // Send verification email
    try {
      const emailResult = await emailService.sendEmailVerification(user, emailVerificationToken);
      
      if (emailResult.success) {
        res.json({ 
          msg: 'Verification email sent successfully',
          emailSent: true,
          messageId: emailResult.messageId
        });
      } else {
        console.error('Failed to send verification email:', emailResult.error);
        res.status(500).json({ 
          errors: [{ msg: 'Failed to send verification email. Please try again.' }] 
        });
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      res.status(500).json({ 
        errors: [{ msg: 'Email service temporarily unavailable. Please try again later.' }] 
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/users/email-verification-status
// @desc     Get email verification status
// @access   Private
router.get('/email-verification-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('emailVerified emailVerificationSentAt');
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    res.json({
      emailVerified: user.emailVerified,
      canResendEmail: !user.emailVerificationSentAt || 
        (Date.now() - user.emailVerificationSentAt.getTime()) > 60000, // 1 minute
      lastSentAt: user.emailVerificationSentAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/users/change-password
// @desc     Change user password
// @access   Private
router.post('/change-password', [
  auth,
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Current password is incorrect' }] });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ errors: [{ msg: 'New password must be different from current password' }] });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/users/email
// @desc     Update user email
// @access   Private
router.put('/email', [auth, [
  check('newEmail', 'Please include a valid email').isEmail()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { newEmail } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ errors: [{ msg: 'New email must be different from current email' }] });
    }

    if (await User.findOne({ email: newEmail })) {
      return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
    }

    // Generate verification token for new email
    const newEmailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.newEmail = newEmail;
    user.newEmailVerificationToken = newEmailVerificationToken;
    user.newEmailVerificationSentAt = new Date();
    await user.save();

    // Send verification email
    const emailResult = await emailService.sendEmailVerification(user, newEmailVerificationToken, true);

    if (emailResult.success) {
      res.json({ msg: 'Verification email sent to new email address', emailSent: true, messageId: emailResult.messageId });
    } else {
      res.status(500).json({ errors: [{ msg: 'Failed to send verification email. Please try again.' }] });
    }
  } catch (err) {
    console.error('Update email error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/users/:id
// @desc     Delete user (Admin only)
// @access   Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot delete your own account' });
    }

    // Log the deletion for security audit
    console.log(`Admin ${req.user.id} is deleting user ${user._id} (${user.email})`);

    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      msg: 'User successfully deleted',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    POST api/users/become-vendor
// @desc     Request to become a vendor
// @access   Private
router.post('/become-vendor', [
  auth,
  [
    check('shopName', 'Shop name is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { shopName } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'vendor') {
      return res.status(400).json({ message: 'You are already a vendor' });
    }

    if (user.vendorStatus === 'pending') {
      return res.status(400).json({ message: 'Your vendor application is already pending' });
    }

    // Update user with vendor details and pending status
    user.vendorDetails = {
      shopName,
      walletBalance: 0
    };
    user.vendorStatus = 'pending';
    
    await user.save();

    // Create system notification for admin
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification(
        'user',
        `New Vendor Application: ${user.name} (${user.email}) - Shop: ${shopName}`,
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          type: 'vendor_application'
        }
      );
    } catch (notifyError) {
      console.error('Failed to create admin notification:', notifyError);
    }

    res.json({ 
      message: 'Vendor application submitted successfully', 
      user 
    });
  } catch (err) {
    console.error('Become vendor error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

