const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  getNetworkData,
  acceptFriendRequest,
  rejectFriendRequest,
  updateLocationAndStatus
} = require('../controllers/friendsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNetworkData);
router.post('/request', protect, sendFriendRequest);
router.post('/accept/:senderId', protect, acceptFriendRequest);
router.post('/reject/:senderId', protect, rejectFriendRequest);
router.put('/location', protect, updateLocationAndStatus);

module.exports = router;