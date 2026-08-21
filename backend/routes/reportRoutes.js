const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  voteReport,
  commentReport,
  flagReport,
  verifyReport,
  resolveReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect, isAuthority } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getReports);

// Protected routes (Log-in required)
router.post('/', protect, createReport);
router.delete('/:id', protect, deleteReport);
router.put('/:id/vote', protect, voteReport);
router.post('/:id/comment', protect, commentReport);
router.put('/:id/flag', protect, flagReport);

// Authority Protected Routes (Log-in + Authority Role required)
router.put('/:id/verify', protect, isAuthority, verifyReport);
router.patch('/:id/verify', protect, isAuthority, verifyReport);

router.put('/:id/resolve', protect, isAuthority, resolveReport);
router.patch('/:id/resolve', protect, isAuthority, resolveReport);

module.exports = router;