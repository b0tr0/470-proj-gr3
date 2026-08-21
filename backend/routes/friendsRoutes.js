const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, friendsController.getFriends);
router.post('/add', protect, friendsController.addFriend);
router.delete('/:id', protect, friendsController.removeFriend);   // NEW

module.exports = router;