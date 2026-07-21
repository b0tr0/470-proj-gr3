const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createHazard, getHazards, voteHazard, deleteHazard } = require('../controllers/hazardController');

router.post('/', protect, createHazard);
router.get('/', protect, getHazards);
router.put('/:id/vote', protect, voteHazard);
router.delete('/:id', protect, deleteHazard);

module.exports = router;