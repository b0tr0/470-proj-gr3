const express = require('express');
const router = express.Router();
// Controller import
const { getFuelStatus, createFuelStatus } = require('../controllers/fuelController');
const { protect } = require('../middleware/authMiddleware'); // Optional middleware

// Route Definitions
router.get('/', getFuelStatus);
router.post('/', protect, createFuelStatus);

module.exports = router;