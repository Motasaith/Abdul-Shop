const express = require('express');
const router = express.Router();
const { negotiatePrice } = require('../controllers/haggleController');

// POST /api/haggle/negotiate
router.post('/negotiate', negotiatePrice);

module.exports = router;
