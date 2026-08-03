const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { reportFuel, getFuelStatuses } = require('../controllers/fuelController');

router.route('/').post(protect, reportFuel).get(getFuelStatuses);

module.exports = router;