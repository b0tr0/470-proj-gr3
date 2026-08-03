const express = require('express');
const router = express.Router();
const authorityController = require('../controllers/authorityController');

router.get('/reports', authorityController.getAuthorityReports);
router.put('/reports/:id/verify', authorityController.updateReportStatus);

module.exports = router;