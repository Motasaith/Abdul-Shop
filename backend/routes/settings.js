const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Setting = require('../models/Setting');
const { encrypt, decrypt } = require('../utils/encryption');

// @route    GET api/settings
// @desc     Get all settings (Admin only)
// @access   Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    // Decrypt keys for admin view (or keep masked and only show if they want to reveal - but for now we mask)
    // Actually, we should send them back masked or encrypted, or just let them overwrite.
    // Let's send back empty string for secret key to security, or a mask.
    const settingsObj = settings.toObject();
    if (settingsObj.payment && settingsObj.payment.stripe) {
      if (settingsObj.payment.stripe.secretKey) {
        settingsObj.payment.stripe.secretKey = '********'; // Mask for security
      }
    }
    res.json(settingsObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/settings
// @desc     Update settings
// @access   Private/Admin
router.put('/', [auth, admin], async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      // Update fields
      const { general, notifications, security, payment, email, appearance } = req.body;
      if (general) settings.general = { ...settings.general, ...general };
      if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
      if (security) settings.security = { ...settings.security, ...security };
      if (payment) {
        // Handle secret key encryption
        if (payment.stripe && payment.stripe.secretKey) {
           // If it's the mask '********', don't update it, keep existing
           if (payment.stripe.secretKey === '********') {
              if (settings.payment.stripe && settings.payment.stripe.secretKey) {
                 payment.stripe.secretKey = settings.payment.stripe.secretKey;
              } else {
                 payment.stripe.secretKey = '';
              }
           } else {
              // It's a new key, encrypt it
              payment.stripe.secretKey = encrypt(payment.stripe.secretKey);
           }
        } else if (settings.payment.stripe && settings.payment.stripe.secretKey) {
           // Key not provided in update, keep existing
           payment.stripe = { ...payment.stripe, secretKey: settings.payment.stripe.secretKey };
        }
        
        settings.payment = { ...settings.payment, ...payment };
      }
      if (email) settings.email = { ...settings.email, ...email };
      if (appearance) settings.appearance = { ...settings.appearance, ...appearance };
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/settings/public
// @desc     Get public settings (for frontend)
// @access   Public
router.get('/public', async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    // Return only safe public info
    const publicSettings = {
      siteName: settings.general.siteName,
      siteUrl: settings.general.siteUrl,
      currency: settings.general.currency,
      language: settings.general.language,
      appearance: settings.appearance,
      payment: {
        stripeEnabled: settings.payment.stripe.isEnabled, // Legacy support mapping
        stripe: {
           isEnabled: settings.payment.stripe.isEnabled,
           publishableKey: settings.payment.stripe.publishableKey
        },
        bankTransfer: {
           isEnabled: settings.payment.bankTransfer.isEnabled,
           accountName: settings.payment.bankTransfer.accountName,
           accountNumber: settings.payment.bankTransfer.accountNumber,
           bankName: settings.payment.bankTransfer.bankName,
           instructions: settings.payment.bankTransfer.instructions
        },
        cod: settings.payment.cod,
        paypalEnabled: false, // Deprecated for now
        codEnabled: settings.payment.cod.isEnabled, // Legacy support
        testMode: settings.payment.testMode
      }
    };
    res.json(publicSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
