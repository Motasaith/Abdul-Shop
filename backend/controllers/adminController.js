const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (buffer, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      reject(new Error('Cloudinary not configured. Please set up your Cloudinary credentials.'));
      return;
    }
    
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'products',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    const cancelledOrders = await Order.find({ orderStatus: 'Cancelled' });
    const lostRevenue = cancelledOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Product.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5);
      
    const recentUsers = await User.find({})
      .select('name email createdAt avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Combine and sort for recent activity
    const activities = [
      ...recentOrders.map(order => ({
        type: 'order',
        message: `New order placed by ${order.user ? order.user.name : 'Unknown'}`,
        amount: order.totalPrice,
        id: order._id,
        createdAt: order.createdAt
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        message: `New user registered: ${user.name}`,
        email: user.email,
        id: user._id,
        createdAt: user.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

    // Get daily stats for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format stats to ensure all days are represented
    const formattedDailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const foundStat = dailyStats.find(stat => stat._id === dateString);
      
      formattedDailyStats.push({
        name: dayName,
        date: dateString,
        revenue: foundStat ? foundStat.revenue : 0,
        orders: foundStat ? foundStat.orders : 0
      });
    }

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lostRevenue,
      recentOrders,
      recentOrders,
      topProducts,
      dailyStats: formattedDailyStats,
      recentActivity: activities
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      category,
      brand,
      countInStock,
      featured,
      sku,
      weight,
      dimensions,
      tags,
      seoTitle,
      seoDescription,
      images,
      videos
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !countInStock) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { name, description, price, category, countInStock }
      });
    }

    // Check if product with same name exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    // Process uploaded image files
    const processedImages = [];
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'image');
          processedImages.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload image' });
        }
      }
    }

    // Process uploaded video files
    const processedVideos = [];
    if (req.files && req.files.videos) {
      for (const file of req.files.videos) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'video');
          processedVideos.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
          return res.status(500).json({ message: 'Failed to upload video' });
        }
      }
    }

    // Process image URLs from form data
    const imageUrls = [];
    let index = 0;
    while (req.body[`imageUrls[${index}][url]`]) {
      if (req.body[`imageUrls[${index}][url]`] && req.body[`imageUrls[${index}][public_id]`]) {
        imageUrls.push({
          url: req.body[`imageUrls[${index}][url]`],
          public_id: req.body[`imageUrls[${index}][public_id]`]
        });
      }
      index++;
    }

    // Process video URLs from form data
    const videoUrls = [];
    index = 0;
    while (req.body[`videoUrls[${index}][url]`]) {
      if (req.body[`videoUrls[${index}][url]`] && req.body[`videoUrls[${index}][public_id]`]) {
        videoUrls.push({
          url: req.body[`videoUrls[${index}][url]`],
          public_id: req.body[`videoUrls[${index}][public_id]`]
        });
      }
      index++;
    }

    // Combine uploaded files and URLs
    const allImages = [...processedImages, ...imageUrls];
    const allVideos = [...processedVideos, ...videoUrls];

    // Handle JSON-based images and videos (from simple form submission)
    if (images && Array.isArray(images)) {
      allImages.push(...images);
    }
    if (videos && Array.isArray(videos)) {
      allVideos.push(...videos);
    }

    const product = new Product({
      name,
      description,
      price: typeof price === 'string' ? parseFloat(price) : price,
      comparePrice: comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined,
      category,
      brand,
      countInStock: typeof countInStock === 'string' ? parseInt(countInStock) : countInStock,
      images: allImages,
      videos: allVideos,
      featured: featured === 'true' || featured === true,
      sku,
      weight: weight ? (typeof weight === 'string' ? parseFloat(weight) : weight) : undefined,
      dimensions,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      seoTitle,
      seoDescription,
      createdBy: req.user.id
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errorMessages 
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Product with this name or SKU already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken -newEmailVerificationToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Add verification status for each user
    const usersWithStatus = users.map(user => ({
      ...user.toObject(),
      verificationStatus: {
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isFullyVerified: user.emailVerified && user.phoneVerified
      }
    }));

    const total = await User.countDocuments(query);

    res.json({
      users: usersWithStatus,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const search = req.query.search || '';
    
    const query = {};
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Find users matching the search term
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const matchingUserIds = matchingUsers.map(user => user._id);
      
      const orConditions = [
        { user: { $in: matchingUserIds } }
      ];

      // If search term is a valid ObjectId, search by order ID
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ _id: search });
      }

      query.$or = orConditions;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Calculate stats for the full result set (ignoring pagination)
    // We need to be careful not to override the status filter if it exists
    
    // Revenue: Matches query AND is NOT Cancelled
    let revenueQuery = { ...query };
    if (revenueQuery.orderStatus) {
      if (revenueQuery.orderStatus === 'Cancelled') {
        // If sorting only by Cancelled, Revenue is 0
        // We handle this logic by checking if the existing filter conflicts
         // Implicitly handled: if status=Cancelled, $ne: Cancelled will match nothing.
         revenueQuery = { ...query, orderStatus: { $ne: 'Cancelled' } }; // This would override 'Cancelled'. 
         // Wait, if query is {orderStatus: 'Cancelled'}, then adding {orderStatus: {$ne: 'Cancelled'} } creates a conflict or overrides.
         // Actually, if user selected 'Cancelled', revenue SHOULD be 0.
         // If user selected 'Processing', revenue is sum of Processing.
      }
    } 
    // The logic is:
    // 1. Base Revenue Query: Matches current filters (search, etc)
    // 2. EXCLUDE Cancelled (Unless the filter specifically asks for only Cancelled, in which case empty)
    
    // Let's use aggregation or separate finds.
    // Simplifying: If the user filters by a status, we respect it.
    // Standard Revenue = Sum of (Query Matches AND Status != Cancelled)
    // Lost Revenue = Sum of (Query Matches AND Status == Cancelled)

    // Note: If query.orderStatus is 'Cancelled', 'Revenue' calc query becomes { orderStatus: 'Cancelled', orderStatus: {$ne: 'Cancelled'} } -> Empty/Conflict.
    // MongoDB doesn't support duplicate keys in object.
    
    // Constructing queries properly:
    const revenueQueryObject = { ...query };
    if (revenueQueryObject.orderStatus === 'Cancelled') {
       // Impossible to have revenue if we only want cancelled orders
       // So we can skip or force 0. 
       // Effectively, we can't add $ne: Cancelled if it's already == Cancelled.
    } else {
       // Add exclusion if not already specified
       // But if query.orderStatus is 'Processing', we don't need $ne: Cancelled explicitly, but adding it is safe?
       // No, { orderStatus: 'Processing' } is sufficient.
       
       // Basically: If query.orderStatus is SET, follow it.
       // If query.orderStatus is NOT SET (All), calculate (All - Cancelled) and (Cancelled).
       
       // BUT, what if I search for "John"?
       // Query: { user: ..., $or: ... }
       // I want Revenue for "John" (excl cancelled) and Lost for "John" (only cancelled).
    }

    // approach: manually sum based on status in a loop? No, too slow for all docs.
    // Database aggregation is best.
    
    /* 
       If I filter by "All":
       - Revenue: Sum where orderStatus != Cancelled
       - Lost: Sum where orderStatus == Cancelled
       
       If I filter by "Processing":
       - Revenue: Sum where orderStatus == Processing
       - Lost: Sum where orderStatus == Processing AND orderStatus == Cancelled (0)
       
       If I filter by "Cancelled":
       - Revenue: Sum where orderStatus == Cancelled AND orderStatus != Cancelled (0)
       - Lost: Sum where orderStatus == Cancelled
    */
    
    // Implementation:
    // 1. Find all docs matching 'query' (without limit/skip).
    // 2. Reduce them. 
    // Since we don't expect millions of orders yet, this is okay. 
    // For scale, use aggregate pipeline. Let's use find to be consistent with current codebase style usually.
    
    const allMatchingOrders = await Order.find(query).select('totalPrice orderStatus');
    
    const totalRevenue = allMatchingOrders.reduce((sum, order) => {
      return order.orderStatus !== 'Cancelled' ? sum + order.totalPrice : sum;
    }, 0);

    const lostRevenue = allMatchingOrders.reduce((sum, order) => {
      return order.orderStatus === 'Cancelled' ? sum + order.totalPrice : sum;
    }, 0);


    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      totalRevenue,
      lostRevenue
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    
    if (orderStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    // Log the deletion for security audit
    console.log(`Admin ${req.user.id} is deleting user ${user._id} (${user.email})`);
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending vendor requests
// @route   GET /api/admin/vendors/requests
// @access  Private/Admin
const getVendorRequests = async (req, res) => {
  try {
    console.log('Fetching vendor requests...');
    const requests = await User.find({ vendorStatus: 'pending' })
      .select('name email phone vendorDetails createdAt')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get vendor requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve vendor request
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private/Admin
const approveVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.vendorStatus !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.role = 'vendor';
    user.vendorStatus = 'approved';
    await user.save();

    // Notify user (email implementation omitted for brevity)
    
    res.json({ message: 'Vendor approved', user });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject vendor request
// @route   PUT /api/admin/vendors/:id/reject
// @access  Private/Admin
const rejectVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.vendorStatus = 'rejected';
    // Optionally remove vendorDetails or keep them for future re-application
    await user.save();

    res.json({ message: 'Vendor rejected', user });
  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminUsers,
  updateUserStatus,
  deleteUser,
  getAdminOrders,
  getAdminOrders,
  updateOrderStatus,
  getVendorRequests,
  approveVendor,
  rejectVendor
};
