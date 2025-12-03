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
    
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Product.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
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
    
    const query = {};
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total
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
  updateOrderStatus
};
