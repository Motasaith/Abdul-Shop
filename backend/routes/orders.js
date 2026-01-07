const express = require('express');
const { check, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route    POST api/orders
// @desc     Create new order
// @access   Private
router.post('/', [
  auth,
  [
    check('orderItems', 'Order items are required').not().isEmpty(),
    check('shippingAddress', 'Shipping address is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
    check('totalPrice', 'Total price is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  try {
    console.log('=== ORDER CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user?.id);
    console.log('User object:', req.user);
    
    if (orderItems && orderItems.length === 0) {
      console.log('Error: No order items provided');
      return res.status(400).json({ msg: 'No order items' });
    }

    console.log('Creating order with data:', {
      orderItems: orderItems?.length || 0,
      userId: req.user.id,
      shippingAddress,
      paymentMethod,
      totalPrice
    });

    const order = new Order({
      orderItems,
      user: req.user.id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    console.log('Order object created, attempting to save...');
    const createdOrder = await order.save();
    console.log('Order saved successfully with ID:', createdOrder._id);

    // Update product stock and check for low stock
    try {
      const notificationService = require('../services/notificationService');
      const Product = require('../models/Product');
      
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.countInStock = Math.max(0, product.countInStock - (item.qty || item.quantity));
          await product.save();

          // Check for low stock (threshold: 5)
          if (product.countInStock <= 5) {
            await notificationService.createNotification(
              'stock',
              `Low stock alert: ${product.name} (Remaining: ${product.countInStock})`,
              {
                productId: product._id,
                productName: product.name,
                currentStock: product.countInStock
              }
            );
          }
        }
      }
    } catch (stockError) {
      console.error('Failed to update stock or create alert:', stockError);
    }
    
    // Populate the order with user and product details for email
    console.log('Populating order for email...');
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price');
    console.log('Order populated successfully');
    
    // Send order confirmation email
    try {
      if (populatedOrder.user && populatedOrder.user.email) {
        console.log('Sending order confirmation email to:', populatedOrder.user.email);
        // Transform order items for email template
        const orderWithItems = {
          ...populatedOrder.toObject(),
          items: populatedOrder.orderItems.map(item => ({
            product: { name: item.product?.name || item.name },
            quantity: item.qty || item.quantity,
            price: item.price
          })),
          totalAmount: populatedOrder.totalPrice
        };
        
        const emailResult = await emailService.sendOrderConfirmation(
          populatedOrder.user,
          orderWithItems
        );
        console.log('Order confirmation email sent:', emailResult.success);
      } else {
        console.log('Skipping email - no user email found');
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the request if email fails
    }
    
    // Create system notification for admin
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification(
        'order',
        `New order #${createdOrder._id} placed by ${req.user.name}`,
        {
          orderId: createdOrder._id,
          userId: req.user.id,
          amount: createdOrder.totalPrice
        }
      );
    } catch (notifyError) {
      console.error('Failed to create admin notification:', notifyError);
    }

    console.log('Order creation successful, returning response');
    res.status(201).json(createdOrder);
  } catch (err) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error details:', err);
    
    // Return more detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ 
        error: 'Server Error', 
        message: err.message,
        stack: err.stack 
      });
    }
    
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// @route    GET api/orders
// @desc     Get logged in user orders
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/orders/stats
// @desc     Get order statistics for analytics
// @access   Private/Admin
// @route    GET api/orders/stats
// @desc     Get order statistics for analytics
// @access   Private/Admin
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const { timeRange = '7days' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    
    // Calculate date ranges based on filter
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
    }

    // Helper to get stats for a period
    // Note: We're calculating "Total" as "Total during this period" to make the time filter meaningful
    const getPeriodStats = async (start, end) => {
      const orders = await Order.countDocuments({
        createdAt: { $gte: start, $lt: end },
        orderStatus: { $ne: 'Cancelled' }
      });
      
      const revenue = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: start, $lt: end },
            orderStatus: { $ne: 'Cancelled' }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);

      const User = require('../models/User');
      const users = await User.countDocuments({
        createdAt: { $gte: start, $lt: end }
      });

      return {
        orders,
        revenue: revenue[0]?.total || 0,
        users
      };
    };

    const currentStats = await getPeriodStats(startDate, now);
    const previousStats = await getPeriodStats(previousStartDate, startDate);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calculateGrowth(currentStats.revenue, previousStats.revenue);
    const orderGrowth = calculateGrowth(currentStats.orders, previousStats.orders);
    const userGrowth = calculateGrowth(currentStats.users, previousStats.users);

    // Avg Order Value (for current period)
    const avgOrderValue = currentStats.orders > 0 
      ? currentStats.revenue / currentStats.orders 
      : 0;

    // Get daily sales data for the selected chart period
    // For 1 year, we might want to group by month, but for simplicity let's do days or auto-granularity
    // If range > 90 days, maybe group by week or month? 
    // For now, let's stick to simple day grouping to keep it consistent with the frontend chart expectance
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Format sales data
    const formattedSalesData = salesData.map(item => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);
      return {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        revenue: item.revenue,
        orders: item.orders
      };
    });

    // Fill in missing days with 0 (optional but looks better on chart)
    // skipping for brevity, Recharts handles gaps okay or we can just show data points

    // Get top products for the period
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          totalQuantity: { $sum: '$orderItems.quantity' }, 
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Get recent activity (last 10 interactions)
    // We can include new users + new orders using $unionWith or separate queries
    // For simplicity, just recent orders for now, as that's what the UI showed mostly
    const recentActivityOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .select('_id totalPrice createdAt user isPaid');

    const User = require('../models/User');
    const recentActivityUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id name createdAt');
    
    // Combine and sort
    let combinedActivity = [
      ...recentActivityOrders.map(order => ({
        id: order._id,
        type: 'order',
        message: `New order #${order._id.toString().slice(-6)} by ${order.user?.name || 'Guest'} (${order.isPaid ? 'Paid' : 'Unpaid'})`,
        timestamp: order.createdAt,
        amount: order.totalPrice
      })),
      ...recentActivityUsers.map(user => ({
        id: user._id,
        type: 'user',
        message: `New user registered: ${user.name}`,
        timestamp: user.createdAt
      }))
    ];

    combinedActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    combinedActivity = combinedActivity.slice(0, 10); // keep top 10

    // Format timestamp for frontend
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " years ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      return Math.floor(seconds) + " seconds ago";
    };

    res.json({
      totalRevenue: currentStats.revenue,
      totalOrders: currentStats.orders,
      totalUsers: currentStats.users,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      ordersGrowth: Math.round(orderGrowth * 100) / 100,
      usersGrowth: Math.round(userGrowth * 100) / 100,
      conversionRate: 0, // Placeholder as we don't track visits yet
      salesTrend: formattedSalesData,
      topProducts: topProducts.map(product => ({
        id: product._id,
        name: product.name,
        image: product.image,
        sales: product.totalQuantity,
        revenue: product.totalRevenue
      })),
      recentActivity: combinedActivity.map(act => ({
        ...act,
        timestamp: formatTimeAgo(act.timestamp)
      }))
    });

  } catch (err) {
    console.error('Stats Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/orders/:id
// @desc     Get order by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns this order or is admin
    // Note: order.user is populated, so we need to check order.user._id or order.user.id
    const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
    if (orderUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/orders/:id/pay
// @desc     Update order to paid
// @access   Private
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();
    
    // Commission & Wallet Logic: Distribute funds to vendors
    try {
      // Re-fetch order with populated product details to access owner
      const populatedOrder = await Order.findById(order._id).populate('orderItems.product');
      
      const vendorEarningsMap = {}; // vendorId -> amount to credit

      populatedOrder.orderItems.forEach(item => {
        // Ensure product still exists and has an owner
        if (item.product && item.product.owner) {
          const vendorId = item.product.owner.toString();
          
          // Calculate earnings (deduct 5% commission)
          const itemTotal = item.quantity * item.price;
          const commissionRate = 0.05; // Platform fee
          const earning = itemTotal * (1 - commissionRate);

          if (vendorEarningsMap[vendorId]) {
            vendorEarningsMap[vendorId] += earning;
          } else {
            vendorEarningsMap[vendorId] = earning;
          }
        }
      });

      // Update Vendor Wallets
      for (const [vendorId, amount] of Object.entries(vendorEarningsMap)) {
        await User.findByIdAndUpdate(vendorId, {
          $inc: { 'vendorDetails.walletBalance': amount }
        });
        
        // Optional: Create a transaction record or notification for the vendor
        // For now, just updating balance is sufficient for MVP
      }
      
      console.log('Commission distributed successfully:', vendorEarningsMap);

    } catch (commissionError) {
      console.error('Commission calculation error:', commissionError);
      // We do not revert the payment status as the payment was successful.
      // Admin should be alerted to fix balances manually if this fails.
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/orders/:id/ship
// @desc     Update order to shipped
// @access   Private/Admin
router.put('/:id/ship', [auth, admin], async (req, res) => {
  try {
    const { trackingNumber, carrier, trackingUrl } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.isShipped = true;
    order.shippedAt = Date.now();
    
    if (trackingNumber) {
      order.trackingInfo = {
        trackingNumber,
        carrier: carrier || 'Unknown',
        trackingUrl: trackingUrl || null
      };
    }

    const updatedOrder = await order.save();
    
    // Send shipping notification email
    try {
      if (order.user && order.user.email) {
        const emailResult = await emailService.sendOrderShipped(
          order.user,
          order,
          order.trackingInfo
        );
        console.log('Order shipped email sent:', emailResult.success);
      }
    } catch (emailError) {
      console.error('Failed to send order shipped email:', emailError);
    }
    
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/orders/:id/deliver
// @desc     Update order to delivered
// @access   Private/Admin
router.put('/:id/deliver', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'Delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/orders/:id/cancel
// @desc     Cancel order
// @access   Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if order is processing
    if (order.orderStatus !== 'Processing') {
      return res.status(400).json({ msg: 'Order cannot be cancelled' });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    GET api/orders/track/:trackingNumber
// @desc     Track order by tracking number (public)
// @access   Public
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    // Find order by tracking number
    const order = await Order.findOne({
      $or: [
        { 'trackingInfo.trackingNumber': trackingNumber },
        { trackingNumber: trackingNumber },
        { _id: trackingNumber.match(/^[0-9a-fA-F]{24}$/) ? trackingNumber : null }
      ]
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ 
        msg: 'Order not found. Please check your tracking number and try again.' 
      });
    }

    // Create tracking history based on order status
    const trackingHistory = [];

    // Order placed
    trackingHistory.push({
      status: 'Order Placed',
      description: 'Your order has been placed successfully',
      date: order.createdAt,
      completed: true
    });

    // Payment confirmed
    if (order.isPaid) {
      trackingHistory.push({
        status: 'Payment Confirmed',
        description: 'Payment has been confirmed and processed',
        date: order.paidAt,
        completed: true
      });
    }

    // Order processing
    if (order.isPaid) {
      trackingHistory.push({
        status: 'Processing',
        description: 'Your order is being prepared for shipment',
        date: order.paidAt,
        completed: true
      });
    }

    // Shipped
    if (order.isShipped) {
      trackingHistory.push({
        status: 'Shipped',
        description: order.trackingInfo?.carrier 
          ? `Shipped via ${order.trackingInfo.carrier}` 
          : 'Your order has been shipped',
        date: order.shippedAt,
        completed: true,
        trackingUrl: order.trackingInfo?.trackingUrl
      });
    }

    // Out for delivery (if shipped but not delivered after 1 day)
    if (order.isShipped && !order.isDelivered) {
      const shippedDate = new Date(order.shippedAt);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (shippedDate < oneDayAgo) {
        trackingHistory.push({
          status: 'Out for Delivery',
          description: 'Your order is out for delivery',
          date: new Date(shippedDate.getTime() + 24 * 60 * 60 * 1000),
          completed: true
        });
      }
    }

    // Delivered
    if (order.isDelivered) {
      trackingHistory.push({
        status: 'Delivered',
        description: 'Your order has been delivered successfully',
        date: order.deliveredAt,
        completed: true
      });
    } else {
      // Add expected delivery if not delivered
      const expectedDelivery = order.estimatedDelivery || 
        (order.shippedAt ? new Date(new Date(order.shippedAt).getTime() + 3 * 24 * 60 * 60 * 1000) : null);
      
      if (expectedDelivery) {
        trackingHistory.push({
          status: 'Expected Delivery',
          description: `Expected to be delivered by ${expectedDelivery.toDateString()}`,
          date: expectedDelivery,
          completed: false,
          estimated: true
        });
      }
    }

    // Return sanitized order data (remove sensitive information)
    const sanitizedOrder = {
      _id: order._id,
      orderItems: order.orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price
      })),
      shippingAddress: {
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
        state: order.shippingAddress.state
      },
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      isPaid: order.isPaid,
      isShipped: order.isShipped,
      isDelivered: order.isDelivered,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      trackingInfo: order.trackingInfo,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      trackingHistory
    };

    res.json(sanitizedOrder);

  } catch (err) {
    console.error('Track order error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    GET api/orders/track-by-order/:orderId
// @desc     Track order by order ID with email verification
// @access   Public
router.post('/track-by-order', [
  [
    check('orderId', 'Order ID is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId, email } = req.body;

  try {
    // Find order and verify email matches
    const order = await Order.findById(orderId).populate('user', 'email');

    if (!order) {
      return res.status(404).json({ 
        msg: 'Order not found. Please check your order ID and try again.' 
      });
    }

    // Verify email matches (case insensitive)
    if (order.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({ 
        msg: 'Email does not match the order. Please check your email and try again.' 
      });
    }

    // Redirect to tracking with tracking number or order ID
    const trackingId = order.trackingInfo?.trackingNumber || order._id;
    
    res.json({
      success: true,
      trackingId,
      redirectUrl: `/track/${trackingId}`
    });

  } catch (err) {
    console.error('Track by order ID error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route    GET api/orders/admin/all
// @desc     Get all orders
// @access   Private/Admin
router.get('/admin/all', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/orders/vendor/stats
// @desc     Get vendor dashboard statistics
// @access   Private (Vendor only)
router.get('/vendor/stats', auth, async (req, res) => {
  try {
    // 1. Get Vendor's Products
    const Product = require('../models/Product');
    const vendorProducts = await Product.find({ owner: req.user.id });
    const vendorProductIds = vendorProducts.map(p => p._id);

    // 2. Get Orders containing these products
    const orders = await Order.find({
      'orderItems.product': { $in: vendorProductIds }
    }).populate('user', 'name');

    // 3. Calculate Stats
    let totalRevenue = 0;
    let totalOrders = orders.length;
    const recentOrders = [];

    // Process orders to calculate vendor-specific revenue
    orders.forEach(order => {
      let orderRevenue = 0;
      let hasVendorItem = false;

      order.orderItems.forEach(item => {
        // Check if this item is one of the vendor's products
        // Note: item.product is an ObjectId, vendorProductIds are ObjectIds
        if (vendorProductIds.some(id => id.toString() === item.product.toString())) {
           orderRevenue += item.quantity * item.price;
           hasVendorItem = true;
        }
      });

      if (hasVendorItem) {
        totalRevenue += orderRevenue;
        // Add to recent orders list (simplified version)
        if (recentOrders.length < 5) {
           recentOrders.push({
             _id: order._id,
             user: order.user,
             totalPrice: order.totalPrice, // Note: This shows FULL order price, maybe confusing? 
             // Ideally we show "Your Share: $X", but for now let's keep it consistent with UI
             // or better, show the order total and status.
             orderStatus: order.orderStatus,
             createdAt: order.createdAt
           });
        }
      }
    });
    
    // Sort recent orders by date desc
    recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      totalProducts: vendorProducts.length,
      totalOrders,
      totalRevenue,
      recentOrders,
      walletBalance: req.user.vendorDetails?.walletBalance || 0
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/orders/vendor/list
// @desc     Get all orders for a vendor
// @access   Private (Vendor only)
router.get('/vendor/list', auth, async (req, res) => {
  try {
     const Product = require('../models/Product');
     const vendorProducts = await Product.find({ owner: req.user.id }).select('_id');
     const vendorProductIds = vendorProducts.map(p => p._id);

     const orders = await Order.find({
       'orderItems.product': { $in: vendorProductIds }
     })
     .populate('user', 'name email')
     .sort({ createdAt: -1 });

     res.json(orders);
  } catch (err) {
     console.error(err.message);
     res.status(500).send('Server Error');
  }
});

module.exports = router;
