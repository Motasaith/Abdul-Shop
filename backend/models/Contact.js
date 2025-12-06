const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['general', 'support', 'order', 'return', 'feedback', 'other'],
      message: 'Subject must be one of: general, support, order, return, feedback, other'
    }
  },
  orderNumber: {
    type: String,
    sparse: true, // Allow multiple null values
    validate: {
      validator: function(v) {
        // Only validate if the subject is order-related and orderNumber is provided
        if (this.subject === 'order' && v) {
          return /^[0-9a-fA-F]{24}$/.test(v);
        }
        return true;
      },
      message: 'Invalid order number format'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$|^0\d{10}$|^[\+]?\d{10,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true
});

// Create indexes for better performance
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ subject: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

// Auto-set priority based on subject
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    switch(this.subject) {
      case 'order':
      case 'return':
        this.priority = 'high';
        break;
      case 'support':
        this.priority = 'medium';
        break;
      default:
        this.priority = 'low';
    }
  }
  next();
});

// Virtual for contact age
contactSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Age in days
});

// Method to mark as resolved
contactSchema.methods.markAsResolved = function(respondedBy, responseMessage) {
  this.status = 'resolved';
  this.response = {
    message: responseMessage,
    respondedBy: respondedBy,
    respondedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);
