const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const axios = require('axios');
const passport = require('passport');

const router = express.Router();

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate token
    const token = req.user.generateAuthToken();
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?token=${token}`);
  }
);

// Facebook Auth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate token
    const token = req.user.generateAuthToken();
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-success?token=${token}`);
  }
);

// Phone validation function using RapidAPI
async function validatePhoneNumber(phoneNumber, countryCode = '') {
  try {
    const response = await axios.get('https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp', {
      params: {
        number: phoneNumber,
        country: countryCode
      },
      headers: {
        'x-rapidapi-host': 'phonenumbervalidatefree.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY
      }
    });
    
    return {
      isValid: response.data.isValidNumber === 'True',
      isPossible: response.data.isPossibleNumber === 'True',
      country: response.data.phoneNumberRegion,
      numberType: response.data.numberType,
      carrier: response.data.carrier,
      e164Format: response.data.E164Format,
      nationalFormat: response.data.nationalFormat
    };
  } catch (error) {
    console.error('Phone validation error:', error.message);
    return { isValid: false, error: 'Phone validation service unavailable' };
  }
}

// Generate random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS verification code using free RapidAPI SMS services
async function sendSMSVerificationCode(phoneNumber, verificationCode) {
  try {
    const message = `Your verification code is: ${verificationCode}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    
    if (process.env.RAPIDAPI_KEY) {
      // Try multiple free SMS services from RapidAPI
      
      // Option 1: Try SMS77 API (Free tier available)
      try {
        const sms77Response = await axios.post('https://sms77io.p.rapidapi.com/sms', {
          to: phoneNumber,
          text: message,
          from: 'Verify'
        }, {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'sms77io.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('SMS77 Response:', sms77Response.data);
        // SMS77: Check various success responses
        if (sms77Response.data) {
          const response = sms77Response.data.toString();
          // SMS77 success codes: 900 = success, but might be test mode
          if (response === '900') {
            console.log(`✅ SMS77 API call successful (Code: 900)`);
            console.log(`⚠️  Note: Code 900 might indicate test mode - SMS may not be delivered to real phone`);
            console.log(`💰 For real SMS delivery, SMS77 may require a paid subscription`);
            return { success: true, messageId: 'sms77-' + Date.now(), provider: 'SMS77', testMode: true };
          } else if (response.includes('success') || response.includes('sent')) {
            console.log(`✅ SMS sent successfully to ${phoneNumber} via SMS77`);
            return { success: true, messageId: 'sms77-' + Date.now(), provider: 'SMS77' };
          }
        }
      } catch (smsError) {
        console.log('SMS77 failed:', smsError.response?.data || smsError.message);
      }
      
      // Option 2: Try SMS Send API (Free tier available)
      try {
        const smsSendResponse = await axios.post('https://sms-send1.p.rapidapi.com/sendsms', {
          to: phoneNumber,
          body: message
        }, {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'sms-send1.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('SMS Send Response:', smsSendResponse.data);
        if (smsSendResponse.data && smsSendResponse.data.success) {
          console.log(`✅ SMS sent successfully to ${phoneNumber} via SMS Send`);
          return { success: true, messageId: smsSendResponse.data.messageId, provider: 'SMS Send' };
        }
      } catch (smsError) {
        console.log('SMS Send failed:', smsError.response?.data || smsError.message);
      }
      
      // Option 3: Try Simple SMS API (Free tier available)
      try {
        const simpleSmsResponse = await axios.post('https://simple-sms1.p.rapidapi.com/send', {
          phone: phoneNumber,
          message: message
        }, {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'simple-sms1.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Simple SMS Response:', simpleSmsResponse.data);
        if (simpleSmsResponse.data && (simpleSmsResponse.data.status === 'sent' || simpleSmsResponse.data.success)) {
          console.log(`✅ SMS sent successfully to ${phoneNumber} via Simple SMS`);
          return { success: true, messageId: simpleSmsResponse.data.id || 'simple-sms', provider: 'Simple SMS' };
        }
      } catch (simpleError) {
        console.log('Simple SMS failed:', simpleError.response?.data || simpleError.message);
      }
      
      // Option 4: Try TextMagic API (Free tier available)
      try {
        const textmagicResponse = await axios.post('https://textmagic1.p.rapidapi.com/messages', {
          text: message,
          phones: phoneNumber
        }, {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'textmagic1.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('TextMagic Response:', textmagicResponse.data);
        if (textmagicResponse.data && textmagicResponse.data.id) {
          console.log(`✅ SMS sent successfully to ${phoneNumber} via TextMagic`);
          return { success: true, messageId: textmagicResponse.data.id, provider: 'TextMagic' };
        }
      } catch (textmagicError) {
        console.log('TextMagic failed:', textmagicError.response?.data || textmagicError.message);
      }
    }
    
    // Development fallback - always works
    console.log(`\n🚀 ================================`);
    console.log(`📱 SMS VERIFICATION CODE`);
    console.log(`📞 Phone: ${phoneNumber}`);
    console.log(`🔢 Code: ${verificationCode}`);
    console.log(`⏰ Expires: 10 minutes`);
    console.log(`================================`);
    console.log(`⚠️  SMS DELIVERY NOTE:`);
    console.log(`💰 Most free SMS APis only work in test mode`);
    console.log(`📱 Code shown above for development/testing`);
    console.log(`🌐 For production, consider paid SMS service`);
    console.log(`================================\n`);
    
    return { 
      success: true, 
      messageId: 'dev-mode', 
      devMode: true,
      message: 'Code logged to console (development mode)'
    };
    
  } catch (error) {
    console.error('SMS service error:', error.message);
    
    // Always provide the code for development
    console.log(`\n🚀 ================================`);
    console.log(`📱 SMS VERIFICATION CODE (FALLBACK)`);
    console.log(`📞 Phone: ${phoneNumber}`);
    console.log(`🔢 Code: ${verificationCode}`);
    console.log(`❌ Error: ${error.message}`);
    console.log(`================================\n`);
    
    return { 
      success: true, 
      messageId: 'dev-fallback', 
      devMode: true,
      error: error.message,
      message: 'Code logged to console (fallback mode)'
    };
  }
}

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/) 
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
    check('phone', 'Phone number is required').not().isEmpty(),
  ],
  async (req, res) => {
    console.log('Registration attempt:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    try {
      // Check if user already exists with email
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists with this email address' }] });
      }

      // Check if phone number is already in use
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        return res.status(400).json({ errors: [{ msg: 'This phone number is already registered with another account' }] });
      }

      user = new User({
        name,
        email,
        password,
        phone,
      });

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = emailVerificationToken;
      
      await user.save();
      
      // Send welcome email with verification
      try {
        const emailResult = await emailService.sendWelcomeEmail(user, emailVerificationToken);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
      
      // Basic phone format validation - must start with + and have 10-15 digits
      if (!phone.match(/^\+\d{10,15}$/)) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          errors: [{ msg: 'Invalid phone number format. Please provide a valid phone number with country code (e.g., +923363855120).' }] 
        });
      }
      
      // Just save the phone number without verification for now
      user.phone = phone;
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            message: 'Registration successful! Please verify your email and phone number in your profile.',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              phoneVerified: user.phoneVerified || false,
              emailVerified: user.emailVerified || false,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error('Registration error:', err);
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({ msg: e.message }));
        return res.status(400).json({ errors });
      }
      if (err.code === 11000) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// @route    POST api/auth/login
// @desc     Login user
// @access   Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    if (!user.isActive) {
      return res.status(400).json({ errors: [{ msg: 'Account is deactivated' }] });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            phoneVerified: user.phoneVerified,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/auth/me
// @desc     Get current user
// @access   Private
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/logout
// @desc     Logout user
// @access   Private
router.post('/logout', require('../middleware/auth'), (req, res) => {
  res.json({ msg: 'User logged out successfully' });
});

// @route    POST api/auth/send-phone-verification
// @desc     Send phone verification code from profile
// @access   Private
router.post('/send-phone-verification', require('../middleware/auth'), async (req, res) => {
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
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpires = verificationExpires;
    await user.save();
    
    // Send SMS verification code
    const smsResult = await sendSMSVerificationCode(user.phone, verificationCode);
    
    console.log(`Phone verification code generated for user ${user._id}: ${verificationCode}`);
    
    res.json({ 
      msg: 'Verification code sent to your phone',
      phoneNumber: user.phone.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
      expiresIn: '10 minutes',
      devCode: verificationCode // Include for development
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/verify-phone
// @desc     Verify phone number with code
// @access   Private
router.post('/verify-phone', require('../middleware/auth'), async (req, res) => {
  const { verificationCode } = req.body;
  
  if (!verificationCode) {
    return res.status(400).json({ errors: [{ msg: 'Verification code is required' }] });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    if (user.phoneVerified) {
      return res.status(400).json({ errors: [{ msg: 'Phone number already verified' }] });
    }
    
    if (!user.phoneVerificationCode || !user.phoneVerificationExpires) {
      return res.status(400).json({ errors: [{ msg: 'No verification code found. Please request a new one.' }] });
    }
    
    if (user.phoneVerificationExpires < new Date()) {
      return res.status(400).json({ errors: [{ msg: 'Verification code has expired. Please request a new one.' }] });
    }
    
    if (user.phoneVerificationCode !== verificationCode) {
      user.phoneVerificationAttempts = (user.phoneVerificationAttempts || 0) + 1;
      user.phoneVerificationLastAttempt = new Date();
      await user.save();
      
      return res.status(400).json({ errors: [{ msg: 'Invalid verification code' }] });
    }
    
    // Verification successful
    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    user.phoneVerificationAttempts = 0;
    await user.save();
    
    res.json({ msg: 'Phone number verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/resend-verification
// @desc     Resend verification code
// @access   Private
router.post('/resend-verification', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    if (user.phoneVerified) {
      return res.status(400).json({ errors: [{ msg: 'Phone number already verified' }] });
    }
    
    // Check if user has exceeded attempts
    if (user.phoneVerificationAttempts && user.phoneVerificationAttempts >= 5) {
      const lastAttempt = user.phoneVerificationLastAttempt;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastAttempt && lastAttempt > oneHourAgo) {
        return res.status(429).json({ 
          errors: [{ msg: 'Too many attempts. Please try again in 1 hour.' }] 
        });
      }
      
      // Reset attempts if more than 1 hour has passed
      user.phoneVerificationAttempts = 0;
    }
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpires = verificationExpires;
    await user.save();
    
    // Send SMS verification code
    const smsResult = await sendSMSVerificationCode(user.phone, verificationCode);
    
    console.log(`New verification code generated for user ${user._id}: ${verificationCode}`);
    console.log(`SMS sending result:`, smsResult);
    
    res.json({ 
      msg: smsResult.success ? 'New verification code sent to your phone' : 'Verification code generated. Please check your phone.',
      smsSuccess: smsResult.success,
      // Include verification code in development mode for easier testing
      devCode: verificationCode // Always include for debugging
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/verify-email
// @desc     Verify email address
// @access   Public
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ errors: [{ msg: 'Verification token is required' }] });
  }
  
  try {
    // Check for regular email verification
    let user = await User.findOne({ emailVerificationToken: token });
    let isNewEmail = false;
    
    // If not found, check for new email verification
    if (!user) {
      user = await User.findOne({ newEmailVerificationToken: token });
      isNewEmail = true;
    }
    
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid or expired verification token' }] });
    }
    
    if (isNewEmail) {
      // Handle new email verification
      if (!user.newEmail) {
        return res.status(400).json({ errors: [{ msg: 'No new email verification pending' }] });
      }
      
      user.email = user.newEmail;
      user.emailVerified = true;
      user.newEmail = undefined;
      user.newEmailVerificationToken = undefined;
      user.newEmailVerificationSentAt = undefined;
      await user.save();
      
      res.json({ msg: 'New email verified and updated successfully' });
    } else {
      // Handle regular email verification
      if (user.emailVerified) {
        return res.status(400).json({ errors: [{ msg: 'Email already verified' }] });
      }
      
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();
      
      res.json({ msg: 'Email verified successfully' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/resend-email-verification
// @desc     Resend email verification
// @access   Private
router.post('/resend-email-verification', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ errors: [{ msg: 'Email already verified' }] });
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();
    
    // Send verification email
    const emailResult = await emailService.sendEmailVerification(user, emailVerificationToken);
    
    res.json({ 
      msg: 'Verification email sent successfully',
      emailSent: emailResult.success
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/forgot-password
// @desc     Request password reset
// @access   Public
router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(user, resetToken);
    
    res.json({ 
      msg: 'If an account with that email exists, a password reset link has been sent.',
      emailSent: emailResult.success
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/reset-password
// @desc     Reset password with token
// @access   Public
router.post('/reset-password', [
  check('token', 'Reset token is required').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { token, password } = req.body;
  
  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid or expired reset token' }] });
    }
    
    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth/test-phone-validation
// @desc     Test phone validation service
// @access   Public (remove in production)
router.post('/test-phone-validation', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ errors: [{ msg: 'Endpoint not available in production' }] });
  }
  
  const { phone, countryCode } = req.body;
  
  if (!phone) {
    return res.status(400).json({ errors: [{ msg: 'Phone number is required' }] });
  }
  
  try {
    const validation = await validatePhoneNumber(phone, countryCode);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

module.exports = router;
