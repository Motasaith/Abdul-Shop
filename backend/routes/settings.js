const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Setting = require('../models/Setting');

// @route    GET api/settings
// @desc     Get all settings (Admin only)
// @access   Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.json(settings);
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
      if (payment) settings.payment = { ...settings.payment, ...payment };
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
        stripeEnabled: settings.payment.stripeEnabled,
        paypalEnabled: settings.payment.paypalEnabled,
        codEnabled: settings.payment.codEnabled,
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
