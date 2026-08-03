const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  createReport, getReports, voteReport, commentReport, flagReport, verifyReport 
} = require('../controllers/reportController');
const { deleteReport } = require('../controllers/reportController');

router.delete('/:id', protect, deleteReport);
router.route('/').post(protect, createReport).get(getReports);
router.route('/:id/vote').put(protect, voteReport);
router.route('/:id/comment').post(protect, commentReport);
router.route('/:id/flag').put(protect, authorize('moderator'), flagReport);
router.route('/:id/verify').put(protect, authorize('authority'), verifyReport);

module.exports = router;
