const express = require('express');

const router = express.Router();

const {

  createReport,

  getReports,

  voteReport,

  commentReport,

  flagReport,

  verifyReport,

  deleteReport,

} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');



// Public routes

router.post('/', createReport);

router.get('/', getReports);

router.delete('/:id', deleteReport);



// Protected routes (Login Required)

router.put('/:id/vote', protect, voteReport);

router.post('/:id/comment', protect, commentReport);

router.put('/:id/flag', protect, flagReport);

router.put('/:id/verify', protect, verifyReport);



module.exports = router; 

