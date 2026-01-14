const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true, // e.g., 'home', 'contact', 'about'
    trim: true,
    lowercase: true
  },
  sections: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PageContent', pageContentSchema);
