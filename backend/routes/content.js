const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const auth = require('../middleware/auth');

// @route   GET api/content/:page
// @desc    Get content for a specific page
// @access  Public
router.get('/:page', async (req, res) => {
  try {
    let content = await PageContent.findOne({ page: req.params.page.toLowerCase() });
    
    // If no content exists yet, return empty structure rather than 404
    // so the frontend can fallback gracefully
    if (!content) {
      return res.json({ page: req.params.page, sections: {} });
    }
    
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/content/:page
// @desc    Update content for a specific page
// @access  Private/Admin
router.put('/:page', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { sections } = req.body;
    const pageName = req.params.page.toLowerCase();

    // Upsert (update if exists, insert if new)
    let content = await PageContent.findOneAndUpdate(
      { page: pageName },
      { 
        $set: { 
          sections: sections,
          lastUpdatedBy: req.user.id
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
