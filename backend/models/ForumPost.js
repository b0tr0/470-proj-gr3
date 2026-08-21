const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const forumPostSchema = new mongoose.Schema({
  title: { type: String, default: 'Community Post' },
  content: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  author: { type: String, default: 'Member' },
  isAnonymous: { type: Boolean, default: false },
  votes: { type: Number, default: 0 },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);