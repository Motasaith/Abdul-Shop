const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// @route    GET api/shop/:id
// @desc     Get public shop profile and products
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const vendorId = req.params.id;

    // 1. Get Vendor Public Profile
    // Explicitly select ONLY public fields. 
    // CRITICAL: Exclude bankDetails, walletBalance, email, phone, etc.
    const vendor = await User.findOne({ 
      _id: vendorId, 
      role: { $in: ['vendor', 'admin'] }, 
      vendorStatus: 'approved' // Only show approved vendors
    }).select('name avatar vendorDetails.shopName vendorDetails.storeDescription vendorDetails.storeLogo vendorDetails.storeBanner createdAt');

    if (!vendor) {
      return res.status(404).json({ msg: 'Shop not found' });
    }

    // 2. Get Vendor's Products
    // Reusing similar logic to products route but specific to vendor
    const products = await Product.find({
      owner: vendorId,
      isActive: true
    })
    .sort({ isNewArrival: -1, createdAt: -1 })
    .select('-costPrice -supplierInfo'); // Exclude sensitive product info if any

    res.json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        shopName: vendor.vendorDetails?.shopName,
        description: vendor.vendorDetails?.storeDescription,
        logo: vendor.vendorDetails?.storeLogo || vendor.avatar?.url,
        banner: vendor.vendorDetails?.storeBanner,
        joinedAt: vendor.createdAt
      },
      products
    });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Shop not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
