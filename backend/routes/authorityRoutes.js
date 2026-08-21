const express = require('express');
const router = express.Router();
const authorityController = require('../controllers/authorityController');

// These should be protected by protect + authorize('authority')
router.get('/reports', authorityController.getAuthorityReports);
router.put('/reports/:id/verify', authorityController.updateReportStatus);

module.exports = router;