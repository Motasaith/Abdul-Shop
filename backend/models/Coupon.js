const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxDiscountAmount: {
    type: Number
  },
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number, // Total number of times this coupon can be used
    default: null // Null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }], // If empty, applies to all vendor's products
  isGlobal: {
    type: Boolean,
    default: false // Admin coupons can be global
  }
}, {
  timestamps: true
});

// Index for quick lookup
couponSchema.index({ code: 1 });
couponSchema.index({ vendor: 1 });

// Method to check validity
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.expiryDate &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

module.exports = mongoose.model('Coupon', couponSchema);
