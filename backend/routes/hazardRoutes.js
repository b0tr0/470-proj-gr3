const express = require('express');
const router = express.Router();
const { createHazard, getHazards, voteHazard, deleteHazard } = require('../controllers/hazardController');


router.post('/', createHazard);
router.get('/', getHazards);
router.put('/:id/vote', voteHazard);
router.delete('/:id', deleteHazard);

module.exports = router;