const User = require('../models/User');

exports.getFriends = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId).populate('friends', 'username status email');
    res.json(user ? user.friends : []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friends', error: err.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const { userId, targetUsername } = req.body;
    const friend = await User.findOne({ username: targetUsername });
    if (!friend) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friend._id } });
    res.json({ message: 'Friend added', friend });
  } catch (err) {
    res.status(400).json({ message: 'Error adding friend', error: err.message });
  }
};