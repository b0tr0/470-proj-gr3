const express = require('express');
const router = express.Router();
const { getAuthorityReports, updateReportStatus } = require('../controllers/authorityController');
const { protect, isAuthority } = require('../middleware/authMiddleware');

router.get('/reports', protect, isAuthority, getAuthorityReports);
router.put('/reports/:id/verify', protect, isAuthority, updateReportStatus);
router.put('/reports/:id', protect, isAuthority, updateReportStatus);

module.exports = router;