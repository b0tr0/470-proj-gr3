const express = require('express');
const router = express.Router();
const { triggerSOS } = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, triggerSOS);

module.exports = router;