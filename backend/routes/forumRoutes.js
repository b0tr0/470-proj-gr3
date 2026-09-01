const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  addComment,
  votePost,
  deletePost
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.post('/:id/comment', protect, addComment);
router.put('/:id/vote', protect, votePost);
router.delete('/:id', protect, deletePost);

module.exports = router;