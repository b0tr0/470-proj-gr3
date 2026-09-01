const express = require('express');
const router = express.Router();
const { sendMessage, getConversation } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/conversation/:friendId', protect, getConversation);

module.exports = router;