const express = require('express');
const router = express.Router();
const trendsController = require('../controllers/trendsController');

router.get('/', trendsController.getMonthlyTrends);

module.exports = router;