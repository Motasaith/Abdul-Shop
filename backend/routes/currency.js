const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache rates to avoid hitting API limits
let ratesCache = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// @route    GET api/currency/rates
// @desc     Get current exchange rates
// @access   Public
router.get('/rates', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if valid
    if (ratesCache.data && (now - ratesCache.timestamp < CACHE_DURATION)) {
      return res.json(ratesCache.data);
    }

    // Fetch new rates
    // Using a free open API for demonstration
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    
    ratesCache = {
      data: response.data,
      timestamp: now
    };

    res.json(ratesCache.data);
  } catch (err) {
    console.error('Error fetching rates:', err.message);
    
    // Fallback if API fails
    if (ratesCache.data) {
      return res.json(ratesCache.data);
    }
    
    res.status(500).json({ msg: 'Failed to fetch exchange rates' });
  }
});

module.exports = router;
