const User = require('../models/User');

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username email');
    res.json(user ? user.friends : []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friends', error: err.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const { targetUsername } = req.body;
    const friend = await User.findOne({ username: targetUsername });
    if (!friend) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: friend._id } });
    res.json({ message: 'Friend added', friend });
  } catch (err) {
    res.status(400).json({ message: 'Error adding friend', error: err.message });
  }
};

// NEW: Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: id } });
    res.json({ message: 'Friend removed' });
  } catch (err) {
    res.status(400).json({ message: 'Error removing friend', error: err.message });
  }
};