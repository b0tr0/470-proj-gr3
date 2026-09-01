const express = require('express');
const router = express.Router();
// Controller import
const { getFuelStatus, createFuelStatus, deleteFuelStatus } = require('../controllers/fuelController');
const { protect } = require('../middleware/authMiddleware'); // Optional middleware

// Route Definitions
router.get('/', getFuelStatus);
router.post('/', protect, createFuelStatus);
router.delete('/:id', protect, deleteFuelStatus);

module.exports = router;