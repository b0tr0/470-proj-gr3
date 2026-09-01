const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  voteReport,
  commentReport,
  voteComment,
  flagReport,
  verifyReport,
  resolveReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect, isAuthority } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getReports);

// Protected routes (Login required)
router.post('/', protect, createReport);
router.delete('/:id', protect, deleteReport);
router.put('/:id/vote', protect, voteReport);
router.post('/:id/comment', protect, commentReport);
router.put('/:id/comments/:commentId/vote', protect, voteComment);
router.put('/:id/flag', protect, flagReport);

// Authority Protected Routes (Handles both PUT and PATCH methods)
router.route('/:id/verify')
  .put(protect, isAuthority, verifyReport)
  .patch(protect, isAuthority, verifyReport);

router.route('/:id/resolve')
  .put(protect, isAuthority, resolveReport)
  .patch(protect, isAuthority, resolveReport);

module.exports = router;