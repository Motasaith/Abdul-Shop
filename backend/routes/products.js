const express = require('express');
const { check, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const uploadMiddleware = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
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

// @route    GET api/products/:id
// @desc     Get product by ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

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
          uploadToCloudinary(file.buffer)
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
// @desc     Answer a question (Admin only)
// @access   Private/Admin
router.put(
  '/:id/questions/:qId/answer',
  [
    auth,
    admin,
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

      const question = product.qnaQuestions.id(req.params.qId);

      if (!question) {
        return res.status(404).json({ msg: 'Question not found' });
      }

      question.answer = {
        text: req.body.answer,
        answeredBy: req.user.id,
        answeredByName: req.user.name || 'Admin',
        answeredAt: Date.now()
      };

      await product.save();

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
  [
    check('name', 'Name is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('category', 'Category is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
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

    const newProduct = new Product({
      ...req.body,
      createdBy: req.user.id,
      owner: req.user.id
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
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

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
