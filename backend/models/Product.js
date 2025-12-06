const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }

  }],
  followUp: {
    comment: String,
    date: Date
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports',
      'Beauty',
      'Health',
      'Toys',
      'Automotive',
      'Other'
    ]
  },
  brand: {
    type: String,
    trim: true
  },
  countInStock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  videos: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  reviews: [reviewSchema],
  numReviews: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot be more than 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot be more than 160 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Delivery and Service Information
  deliveryInfo: {
    standardDelivery: {
      available: { type: Boolean, default: true },
      days: { type: String, default: '5-7 days' },
      cost: { type: Number, default: 0 }
    },
    cashOnDelivery: {
      available: { type: Boolean, default: true }
    },
    freeDelivery: {
      available: { type: Boolean, default: false },
      minOrder: { type: Number, default: 0 }
    }
  },
  // Return and Warranty Information
  returnPolicy: {
    available: { type: Boolean, default: true },
    days: { type: Number, default: 14 },
    description: { type: String, default: '14 days easy return' }
  },
  warranty: {
    available: { type: Boolean, default: false },
    duration: { type: String },
    description: { type: String },
    type: { type: String, enum: ['Manufacturer', 'Seller', 'Brand'], default: 'Seller' }
  },
  // Product Specifications
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  // What's in the box
  whatsInBox: [{
    item: { type: String, required: true },
    quantity: { type: Number, default: 1 }
  }],
  // Questions and Answers
  qnaQuestions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: { type: String, required: true },
    question: { type: String, required: true },
    answer: {
      text: { type: String },
      answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      answeredByName: { type: String },
      answeredAt: { type: Date }
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Create indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for average rating calculation
productSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

// Pre-save middleware to update rating and numReviews
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
