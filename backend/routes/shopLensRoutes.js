const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeImage } = require('../controllers/shopLensController');

// Configure multer for memory storage (buffer access)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/shoplens/analyze
router.post('/analyze', upload.single('image'), analyzeImage);

module.exports = router;
