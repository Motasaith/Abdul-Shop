const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeProfile } = require('../controllers/giftScoutController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/gift-scout/analyze
router.post('/analyze', upload.single('image'), analyzeProfile);

module.exports = router;
