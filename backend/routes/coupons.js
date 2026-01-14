const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const User = require('../models/User');

// Middleware to check if user is vendor or admin
const vendorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ msg: 'Not authorized as a vendor or admin' });
  }
};

// @route    GET api/coupons
// @desc     Get all coupons (Admin only)
// @access   Private (Admin)
router.get('/', [auth, vendorOrAdmin], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized as admin' });
    }
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/coupons
// @desc     Create a new coupon
// @access   Private (Vendor/Admin)
router.post(
  '/',
  [
    auth,
    vendorOrAdmin,
    [
      check('code', 'Coupon code is required').not().isEmpty(),
      check('discountPercentage', 'Discount percentage is required and must be between 0 and 100').isFloat({ min: 0, max: 100 }),
      check('expiryDate', 'Expiry date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        code,
        discountPercentage,
        maxDiscountAmount,
        minPurchaseAmount,
        startDate,
        expiryDate,
        usageLimit,
        applicableProducts, // Array of Product IDs
        isGlobal
      } = req.body;

      // Check if coupon code already exists for this vendor
      // Note: We might want codes to be unique globally or per vendor. 
      // For simplicity, let's enforce global uniqueness on the code string to avoid collisions in usage.
      let existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ msg: 'Coupon code already exists' });
      }

      // If applicableProducts provided, verify ownership
      if (applicableProducts && applicableProducts.length > 0) {
        if (req.user.role === 'vendor') {
           const products = await Product.find({ _id: { $in: applicableProducts } });
           const notOwned = products.some(p => p.owner.toString() !== req.user.id);
           if (notOwned) {
             return res.status(401).json({ msg: 'You can only create coupons for your own products' });
           }
        }
      }

      const coupon = new Coupon({
        code,
        discountPercentage,
        maxDiscountAmount,
        minPurchaseAmount,
        startDate: startDate || Date.now(),
        expiryDate,
        usageLimit,
        vendor: req.user.id,
        applicableProducts: applicableProducts || [],
        isGlobal: req.user.role === 'admin' ? (isGlobal || false) : false
      });

      await coupon.save();
      res.json(coupon);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/coupons/my
// @desc     Get logged-in vendor's coupons
// @access   Private (Vendor)
router.get('/my', [auth, vendorOrAdmin], async (req, res) => {
  try {
    const coupons = await Coupon.find({ vendor: req.user.id }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/coupons/:id
// @desc     Update a coupon
// @access   Private (Vendor/Admin)
router.put('/:id', [auth, vendorOrAdmin], async (req, res) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found' });
    }

    // Check ownership
    if (coupon.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to update this coupon' });
    }

    // Update fields
    // Note: We typically don't allow changing the 'code' if it's already used, but for now allow it.
    // Better to just allow updating status/dates.
    const fieldsToUpdate = [
      'discountPercentage', 'maxDiscountAmount', 'minPurchaseAmount', 
      'startDate', 'expiryDate', 'usageLimit', 'applicableProducts', 'isActive'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/coupons/:id
// @desc     Delete a coupon
// @access   Private (Vendor/Admin)
router.delete('/:id', [auth, vendorOrAdmin], async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ msg: 'Coupon not found' });
    }

    if (coupon.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete this coupon' });
    }

    await coupon.remove();
    res.json({ msg: 'Coupon removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/coupons/validate
// @desc     Validate a coupon for a cart
// @access   Private (User)
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, cartTotal, cartItems } = req.body; // cartItems should contain product IDs

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ msg: 'Invalid coupon code' });
    }

    // Check validity (dates, usage limit, active)
    if (!coupon.isValid()) {
      return res.status(400).json({ msg: 'Coupon is expired or inactive' });
    }

    // Check min purchase
    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ msg: `Minimum purchase of $${coupon.minPurchaseAmount} required` });
    }

    // Check product applicability
    // Logic:
    // 1. If isGlobal, applies to whole cart? Or just vendor's products? Usually global means all.
    // 2. If applicableProducts is NOT empty, verify at least one item matches, OR apply discount only to those items?
    //    Simplest MVP: Discount applies to the whole cart total if conditions met, 
    //    BUT technically strictly vendor coupons should only discount vendor items.
    //    Let's refine:
    
    let discountableAmount = 0;

    if (coupon.isGlobal) {
      discountableAmount = cartTotal;
    } else {
      // Find items in cart that belong to the coupon's vendor or are in applicableProducts
      // We need to look up products in database to check owner if not passed in cartItems
      // Assuming cartItems = [{ product: 'id', price: 10, quantity: 2 }]
      
      const productIds = cartItems.map(item => item.product);
      const dbProducts = await Product.find({ _id: { $in: productIds } });

      cartItems.forEach(item => {
        const product = dbProducts.find(p => p._id.toString() === item.product);
        if (!product) return;

        // Check if product belongs to vendor
        const isVendorProduct = product.owner.toString() === coupon.vendor.toString();
        
        // Check if specifically applicable (if list exists)
        const isApplicable = coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(product._id);

        if (isVendorProduct && isApplicable) {
           discountableAmount += (item.price * item.quantity);
        }
      });
    }

    if (discountableAmount === 0) {
      return res.status(400).json({ msg: 'Coupon is not applicable to any items in your cart' });
    }

    // Calculate discount
    let discount = (discountableAmount * coupon.discountPercentage) / 100;

    // Cap at max discount
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    res.json({
      success: true,
      discount,
      code: coupon.code
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
