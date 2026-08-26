const express = require('express');
const router = express.Router();
const { createHazard, getHazards, voteHazard, deleteHazard } = require('../controllers/hazardController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createHazard);
router.get('/', getHazards);
router.put('/:id/vote', protect, voteHazard);
router.delete('/:id', protect, deleteHazard);

module.exports = router;