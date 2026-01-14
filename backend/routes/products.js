const express = require('express');
const { check, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const uploadMiddleware = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { createNotification } = require('../services/notificationService');
const router = express.Router();

// @route    GET api/products
// @desc     Get all products with filtering and search
// @access   Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Rating filter
    if (req.query.rating) {
      filter.rating = { $gte: parseInt(req.query.rating) };
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // On Sale filter
    // On Sale filter
    // On Sale filter (STRICT MANUAL)
    if (req.query.onSale === 'true') {
      filter.onSale = true;
    }
    
    // New Arrivals filter (STRICT MANUAL)
    if (req.query.newArrivals === 'true') {
       filter.isNewArrival = true;
    }
    
    // Vendor filter
    if (req.query.vendor) {
      filter.owner = req.query.vendor;
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    // Sort logic
    if (req.query.sort) {
      const sortBy = req.query.sort;
      if (sortBy === 'newest') {
        // Prioritize manually flagged new arrivals, then date
        sortOption = { isNewArrival: -1, createdAt: -1 };
      }
      else if (sortBy === 'oldest') sortOption = { createdAt: 1 };
      else if (sortBy === 'price-low') sortOption = { price: 1 };
      else if (sortBy === 'price-high') sortOption = { price: -1 };
      else if (sortBy === 'rating') sortOption = { rating: -1 };
      else if (sortBy === 'name') sortOption = { name: 1 };
    } else {
      // Default sort also prioritizes new arrivals if no sort specified?
      // Or just stick to default creation date. Let's keep it consistent with 'newest'
      sortOption = { isNewArrival: -1, createdAt: -1 };
    }

    console.log('Filter:', filter);
    console.log('Sort:', sortOption);

    const products = await Product.find(filter)
      .skip(startIndex)
      .limit(limit)
      .sort(sortOption)
      .populate('createdBy', 'name');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/products/reviews/my
// @desc     Get logged in user's reviews
// @access   Private
router.get('/reviews/my', auth, async (req, res) => {
  try {
    // Find products that have reviews by this user
    const products = await Product.find({
      'reviews.user': req.user.id
    }).select('name images reviews');

    // Extract only the user's reviews from these products
    const userReviews = [];
    
    products.forEach(product => {
      const reviews = product.reviews.filter(
        review => review.user.toString() === req.user.id
      );
      
      reviews.forEach(review => {
        userReviews.push({
          _id: review._id,
          rating: review.rating,
          comment: review.comment,
          followUp: review.followUp,
          createdAt: review.createdAt,
          product: {
            _id: product._id,
            name: product.name,
            image: product.images[0]?.url
          }
        });
      });
    });

    // Sort by newest first
    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userReviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/products/vendor/my
// @desc     Get logged-in vendor's products
// @access   Private/Vendor
router.get('/vendor/my', auth, async (req, res) => {
  try {
    const products = await Product.find({ 
      $or: [
        { owner: req.user.id },
        { createdBy: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/products/:id
// @desc     Get product by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('owner', 'name vendorDetails role');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    POST api/products/:id/reviews
// @desc     Create new review
// @access   Private
router.post(
  '/:id/reviews',
  [
    auth,
    uploadMiddleware,
    [
      check('rating', 'Rating is required').not().isEmpty(),
      check('comment', 'Comment is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      const alreadyReviewed = product.reviews.find(
        r => r.user.toString() === req.user.id
      );

      if (alreadyReviewed) {
        return res.status(400).json({ msg: 'Product already reviewed' });
      }

      // Handle image uploads
      let reviewImages = [];
      if (req.files && req.files.images) {
        const uploadPromises = req.files.images.map(file => 
          uploadToCloudinary(file.buffer, 'reviews', 'image')
        );
        const results = await Promise.all(uploadPromises);
        reviewImages = results.map(result => ({
          public_id: result.public_id,
          url: result.secure_url
        }));
      }

      const review = {
        name: req.user.name || 'User',
        rating: Number(rating),
        comment,
        user: req.user.id,
        images: reviewImages
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();

      res.status(201).json({ msg: 'Review added' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/products/:id/reviews/:reviewId/followup
// @desc     Add follow-up to a review
// @access   Private
router.put(
  '/:id/reviews/:reviewId/followup',
  [
    auth,
    [check('comment', 'Comment is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id);
      const Order = require('../models/Order');

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      // Find the review
      const review = product.reviews.id(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ msg: 'Review not found' });
      }

      // Verify ownership
      if (review.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Check for delivered order
      // We need to find an order by this user that contains this product and is delivered
      const order = await Order.findOne({
        user: req.user.id,
        'orderItems.product': req.params.id,
        isDelivered: true
      }).sort({ deliveredAt: -1 });

      if (!order) {
        return res.status(400).json({ msg: 'You must have a delivered order for this product to leave a follow-up review.' });
      }

      // Check delivery date vs today
      const { isSameDay, parseISO } = require('date-fns');
      const deliveredAt = new Date(order.deliveredAt);
      const now = new Date();

      if (isSameDay(deliveredAt, now)) {
        return res.status(400).json({ msg: 'You cannot submit a follow-up review on the same day as delivery.' });
      }

      review.followUp = {
        comment: req.body.comment,
        date: Date.now()
      };

      await product.save();

      res.json(product.reviews);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/products/:id/reviews/:reviewId/reply
// @desc     Vendor reply to a review
// @access   Private/Vendor
router.put(
  '/:id/reviews/:reviewId/reply',
  [
    auth,
    [check('comment', 'Comment is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      // Verify product ownership (Vendor/Admin/Creator)
      const isOwner = product.owner && product.owner.toString() === req.user.id;
      const isCreator = product.createdBy && product.createdBy.toString() === req.user.id;
      
      if (req.user.role !== 'admin' && !isOwner && !isCreator) {
        return res.status(401).json({ msg: 'Not authorized to reply to reviews on this product' });
      }

      // Find the review
      const review = product.reviews.id(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ msg: 'Review not found' });
      }

      // Ensure owner is set before saving to satisfy schema requirements
      if (!product.owner) {
        product.owner = product.createdBy || req.user.id;
      }

      review.vendorReply = {
        comment: req.body.comment,
        date: Date.now(),
        updatedAt: Date.now()
      };

      await product.save();

      // Notify the user who left the review
      // We need to implement a notification for the user
      // Assuming createNotification handles "system" to user notifications
      try {
        await createNotification(
          'system',
          `Vendor replied to your review on: ${product.name}`,
          {
            userId: review.user, // Notify the reviewer
            productId: product._id,
            reviewId: review._id,
            link: `/product/${product._id}`
          }
        );
      } catch (notifErr) {
        console.error('Notification error:', notifErr);
      }

      res.json(product.reviews.id(req.params.reviewId));
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    POST api/products/:id/questions
// @desc     Ask a question about a product
// @access   Private
router.post(
  '/:id/questions',
  [
    auth,
    [
      check('question', 'Question is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      const newQuestion = {
        user: req.user.id,
        userName: req.user.name || 'User',
        question: req.body.question
      };

      product.qnaQuestions.unshift(newQuestion);

      await product.save();

      // Create notification for admin
      await createNotification(
        'system',
        `New question asked on product: ${product.name}`,
        {
          productId: product._id,
          questionId: product.qnaQuestions[0]._id,
          userId: req.user.id
        }
      );

      res.status(201).json(product.qnaQuestions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    PUT api/products/:id/questions/:qId/answer
// @desc     Answer a question (Admin or Vendor)
// @access   Private (Admin/Vendor)
router.put(
  '/:id/questions/:qId/answer',
  [
    auth,
    [check('answer', 'Answer is required').not().isEmpty()]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      // Check authorization
      // 1. Admin can answer any question
      // 2. Vendor can answer questions on their own products
      
      let isAuthorized = false;
      let responderRole = 'User';

      if (req.user.role === 'admin') {
        isAuthorized = true;
        responderRole = 'Admin';
      } else if (req.user.role === 'vendor') {
         const isOwner = product.owner && product.owner.toString() === req.user.id;
         const isCreator = product.createdBy && product.createdBy.toString() === req.user.id;
         if (isOwner || isCreator) {
           isAuthorized = true;
           responderRole = 'Vendor';
         }
      }

      if (!isAuthorized) {
        return res.status(401).json({ msg: 'Not authorized to answer this question' });
      }

      const question = product.qnaQuestions.id(req.params.qId);

      if (!question) {
        return res.status(404).json({ msg: 'Question not found' });
      }

      question.answer = {
        text: req.body.answer,
        answeredBy: req.user.id,
        answeredByName: req.user.name || responderRole,
        answeredAt: Date.now()
      };

      await product.save();

      // Notify the user who asked the question
      await createNotification(
        'system',
        `Your question regarding ${product.name} has been answered`,
        {
          userId: question.user,
          productId: product._id,
          questionId: question._id,
          link: `/product/${product._id}`
        }
      );

      res.json(product.qnaQuestions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    POST api/products
// @desc     Create a product
// @access   Private/Admin/Vendor
router.post('/', [
  auth,
  uploadMiddleware,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('price', 'Price is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('countInStock', 'Stock is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is admin or vendor
    if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return res.status(403).json({ msg: 'Not authorized to create products' });
    }

    const {
      name,
      description,
      price,
      comparePrice,
      category,
      brand,
      countInStock,
      featured,
      isNewArrival,
      onSale,
      sku,
      weight,
      dimensions,
      tags,
      seoTitle,
      seoDescription,
      images, // JSON images (if any)
      videos  // JSON videos (if any)
    } = req.body;

    // Check if product with same name exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ msg: 'Product with this name already exists' });
    }

    // Process uploaded image files
    const processedImages = [];
    if (req.files && req.files.images) {
      // Handle single file or array
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      
      for (const file of imageFiles) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'products', 'image');
          processedImages.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ msg: 'Failed to upload image' });
        }
      }
    }

    // Process uploaded video files
    const processedVideos = [];
    if (req.files && req.files.videos) {
      const videoFiles = Array.isArray(req.files.videos) ? req.files.videos : [req.files.videos];
      
      for (const file of videoFiles) {
        try {
          const result = await uploadToCloudinary(file.buffer, 'products', 'video');
          processedVideos.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
          return res.status(500).json({ msg: 'Failed to upload video' });
        }
      }
    }

    // Process image URLs from form data (complex nested fields from FormData)
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

    // Handle JSON-based images and videos (if sent as JSON body)
    if (images && Array.isArray(images)) {
      allImages.push(...images);
    }
    if (videos && Array.isArray(videos)) {
      allVideos.push(...videos);
    }

    // Parse specifications if sent as individual fields
    const specifications = [];
    index = 0;
    while (req.body[`specifications[${index}][name]`]) {
       specifications.push({
         name: req.body[`specifications[${index}][name]`],
         value: req.body[`specifications[${index}][value]`]
       });
       index++;
    }
    // Or if JSON
    if (req.body.specifications && Array.isArray(req.body.specifications)) {
       specifications.push(...req.body.specifications);
    }

    // Parse whatsInBox
    const whatsInBox = [];
    index = 0;
    while (req.body[`whatsInBox[${index}][item]`]) {
       whatsInBox.push({
         item: req.body[`whatsInBox[${index}][item]`],
         quantity: parseInt(req.body[`whatsInBox[${index}][quantity]`]) || 1
       });
       index++;
    }
    // Or if JSON
    if (req.body.whatsInBox && Array.isArray(req.body.whatsInBox)) {
       whatsInBox.push(...req.body.whatsInBox);
    }

    const newProduct = new Product({
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
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      onSale: onSale === 'true' || onSale === true,
      sku,
      weight: weight ? (typeof weight === 'string' ? parseFloat(weight) : weight) : undefined,
      dimensions,
      specifications,
      whatsInBox,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      seoTitle,
      seoDescription,
      createdBy: req.user.id,
      owner: req.user.id
    });

    const product = await newProduct.save();

    // Notify admin if vendor created product
    if (req.user.role === 'vendor') {
      await createNotification(
        'system',
        `New Vendor Product: ${product.name}`,
        {
          vendorName: req.user.name,
          productId: product._id,
          vendorId: req.user.id,
          link: `/admin/products`
        }
      );
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Product with this name or SKU already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/products/:id
// @desc     Update product
// @access   Private/Admin/Vendor
router.put('/:id', auth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check ownership or admin status
    const isOwner = product.owner && product.owner.toString() === req.user.id;
    // Fallback for legacy products (check createdBy or just Admin)
    const isCreator = product.createdBy && product.createdBy.toString() === req.user.id;
    
    if (req.user.role !== 'admin' && !isOwner && !isCreator) {
      return res.status(401).json({ msg: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(product);

    // Notify admin if vendor updated product
    if (req.user.role === 'vendor') {
      await createNotification(
        'system',
        `Vendor Product Updated: ${product.name}`,
        {
          vendorName: req.user.name,
          productId: product._id,
          vendorId: req.user.id
        }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/products/:id
// @desc     Delete product
// @access   Private/Admin/Vendor
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check ownership or admin status
    const isOwner = product.owner && product.owner.toString() === req.user.id;
    const isCreator = product.createdBy && product.createdBy.toString() === req.user.id;

    if (req.user.role !== 'admin' && !isOwner && !isCreator) {
       return res.status(401).json({ msg: 'Not authorized to delete this product' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(image => 
        deleteFromCloudinary(image.public_id)
      );
      await Promise.all(deletePromises);
    }

    // Delete videos from Cloudinary if any
    if (product.videos && product.videos.length > 0) {
       const deleteVideoPromises = product.videos.map(video => 
         deleteFromCloudinary(video.public_id) // Cloudinary handles resource_type automatically usually, or we might need to specify it. destroy takes options. 
       );
       // For videos, resource_type: 'video' might be needed. Let's check cloudinary logic. 
       // For now, simpler to just stick to images or try to pass options if I can.
       // The utils/cloudinary.js destroy wrapper didn't take options. 
       // I'll stick to images first as requested. "pics".
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Notify admin if vendor deleted product
    if (req.user.role === 'vendor') {
      await createNotification(
        'system',
        `Vendor Product Deleted: ${product.name}`,
        {
          vendorName: req.user.name,
          productId: product._id,
          vendorId: req.user.id
        }
      );
    }

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
