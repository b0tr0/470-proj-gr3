const express = require('express');
const router = express.Router();
const { getFuelStatuses, createFuelStatus } = require('../controllers/fuelController');

// Clean root-level endpoints
router.get('/', getFuelStatuses);
router.post('/', createFuelStatus);

module.exports = router;