const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Middleware to check if user is vendor
const vendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    res.status(401).json({ msg: 'Not authorized as a vendor' });
  }
};

// @route    GET api/vendor/analytics
// @desc     Get vendor analytics (sales, revenue, top products)
// @access   Private/Vendor
router.get('/analytics', [auth, vendor], async (req, res) => {
  try {
    const { timeRange = '30days' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === '7days') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === '90days') {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      // Default 30 days
      startDate.setDate(endDate.getDate() - 30);
    }

    // 1. Get all products belonging to this vendor
    const vendorProducts = await Product.find({ owner: req.user.id }).select('_id name');
    const vendorProductIds = vendorProducts.map(p => p._id);

    // 2. Aggregate Orders to find sales of these products
    const salesData = await Order.aggregate([
      // Match orders created in range and not cancelled
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      // Unwind items to filter by vendor's products
      { $unwind: '$orderItems' },
      // Match only items that belong to this vendor
      {
        $match: {
          'orderItems.product': { $in: vendorProductIds }
        }
      },
      // Group by Date for the graph
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          dailyRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          dailySales: { $sum: '$orderItems.quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Top Selling Products
    const topProducts = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'Cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$orderItems' },
      {
        $match: {
          'orderItems.product': { $in: vendorProductIds }
        }
      },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Format Data for Recharts
    // Fill in missing days with 0? Recharts can handle it but better to have continuous data.
    // For MVP, returning sparse data is fine.

    // Calculate totals
    const totalRevenue = salesData.reduce((acc, curr) => acc + curr.dailyRevenue, 0);
    const totalSales = salesData.reduce((acc, curr) => acc + curr.dailySales, 0);

    res.json({
      totalRevenue,
      totalSales,
      salesGraph: salesData.map(item => ({
        date: item._id,
        revenue: item.dailyRevenue,
        sales: item.dailySales
      })),
      topProducts: topProducts.map(p => ({
        id: p._id,
        name: p.name,
        sold: p.totalSold,
        revenue: p.revenue
      }))
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/vendor/orders/:id/status
// @desc     Update order status (Vendor)
// @access   Private/Vendor
router.put('/orders/:id/status', [auth, vendor], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Verify vendor owns at least one product in this order
    const vendorProducts = await Product.find({ owner: req.user.id }).select('_id');
    const vendorProductIds = vendorProducts.map(p => p._id.toString());
    
    const hasVendorProduct = order.orderItems.some(item => 
      vendorProductIds.includes(item.product.toString())
    );

    if (!hasVendorProduct) {
      return res.status(403).json({ msg: 'Not authorized to update this order' });
    }

    // Update status
    order.orderStatus = status;

    if (status === 'Shipped') {
      order.isShipped = true;
      order.shippedAt = Date.now();
    } else if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/vendor/profile
// @desc     Update vendor store profile
// @access   Private/Vendor
router.put('/profile', [auth, vendor], async (req, res) => {
  try {
    const { shopName, storeDescription, storeLogo, storeBanner, bankDetails } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields if provided
    if (shopName) user.vendorDetails.shopName = shopName;
    if (storeDescription) user.vendorDetails.storeDescription = storeDescription;
    if (storeLogo) user.vendorDetails.storeLogo = storeLogo;
    if (storeBanner) user.vendorDetails.storeBanner = storeBanner;
    if (bankDetails) user.vendorDetails.bankDetails = bankDetails;

    await user.save();
    res.json(user.vendorDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
