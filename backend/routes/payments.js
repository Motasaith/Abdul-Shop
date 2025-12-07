const express = require('express');
const auth = require('../middleware/auth');
const Setting = require('../models/Setting');
const { decrypt } = require('../utils/encryption');
const stripe = require('stripe'); // Initialize later

const router = express.Router();

// @route    POST api/payments/create-payment-intent
// @desc     Create payment intent for Stripe
// @access   Private
router.post('/create-payment-intent', auth, async (req, res) => {
  const { amount, currency = 'pkr' } = req.body;

  try {
    // Fetch settings
    const settings = await Setting.getSettings();
    if (!settings.payment.stripe.isEnabled) {
      return res.status(400).json({ error: 'Stripe payments are disabled' });
    }

    const secretKey = decrypt(settings.payment.stripe.secretKey);
    const stripeInstance = stripe(secretKey);

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route    POST api/payments/webhook
// @desc     Handle Stripe webhook
// @access   Public
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // We still need the webhook secret from env or settings. Usually webhook secret is static per endpoint/account.
    // For now assuming it's still in ENV or you can add it to settings too.
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // Handle successful payment here
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @route    GET api/payments/config
// @desc     Get Stripe publishable key
// @access   Public
router.get('/config', async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.json({
      publishableKey: settings.payment.stripe.publishableKey,
      isEnabled: settings.payment.stripe.isEnabled
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/payments/methods
// @desc     Get enabled payment methods
// @access   Public
router.get('/methods', async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    const methods = [];
    
    if (settings.payment.stripe.isEnabled) {
      methods.push({ id: 'card', name: 'Credit/Debit Card' });
    }
    
    if (settings.payment.bankTransfer.isEnabled) {
      methods.push({ 
        id: 'bank', 
        name: 'Bank Transfer',
        details: settings.payment.bankTransfer 
      });
    }
    
    if (settings.payment.cod.isEnabled) {
      methods.push({ id: 'cod', name: 'Cash on Delivery' });
    }
    
    res.json(methods);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
