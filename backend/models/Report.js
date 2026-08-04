const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' }, // Holds URL from image host
  category: { 
    type: String, 
    enum: ['roadblock', 'accident', 'discussion', 'other'], 
    required: true 
  },
  severity: {
    type: String,
    enum: ['moderate', 'high', 'severe'],
    default: 'moderate',
    required: true
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  moderatorFlag: { 
    type: String, 
    enum: ['none', 'accident', 'false/misleading'], 
    default: 'none' 
  },
  authorityStatus: { 
    type: String, 
    enum: ['unverified', 'verified', 'confirmed', 'outdated', 'disputed'], 
    default: 'unverified' 
  },
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deletedAt: { type: Date, default: null },
  deleteReason: { 
    type: String, 
    enum: ['irrelevant', 'resolved', 'privacy', 'other'], default: null},
  isAnonymous: { 
    type: Boolean,
    default: false
  },
  expiresAt: { 
    type: Date,
    required: true
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);