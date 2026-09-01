const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc Send friend request by username
// @route POST /api/friends/request
// @access Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const { targetUsername } = req.body;
    const sender = req.user;

    // Disallow authority accounts from sending requests
    if (sender.role === 'authority') {
      return res.status(403).json({ message: 'Official authority accounts cannot send friend requests.' });
    }

    if (!targetUsername || !targetUsername.trim()) {
      return res.status(400).json({ message: 'Please enter a username.' });
    }

    const cleanUsername = targetUsername.trim();
    const recipient = await User.findOne({ 
      username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } 
    });

    if (!recipient) {
      return res.status(404).json({ message: `User "${cleanUsername}" not found.` });
    }

    // Disallow sending requests to authority accounts
    if (recipient.role === 'authority') {
      return res.status(400).json({ message: 'Official authority accounts cannot be added as personal friends.' });
    }

    if (recipient._id.toString() === sender._id.toString()) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
    }

    if (recipient.friends && recipient.friends.includes(sender._id)) {
      return res.status(400).json({ message: `You are already friends with ${recipient.username}.` });
    }

    recipient.friendRequests = recipient.friendRequests || [];
    if (recipient.friendRequests.includes(sender._id)) {
      return res.status(400).json({ message: 'Friend request already sent and pending.' });
    }

    recipient.friendRequests.push(sender._id);
    await recipient.save();

    // Create Notification for recipient
    await Notification.create({
      recipient: recipient._id,
      sender: sender._id,
      type: 'friend_request',
      title: '👥 New Friend Request',
      message: `${sender.username} sent you a friend request on User Network.`
    });

    res.status(200).json({ 
      message: `Friend request sent to ${recipient.username} successfully!` 
    });
  } catch (err) {
    console.error('Send Friend Request Error:', err);
    res.status(500).json({ message: 'Failed to send friend request', error: err.message });
  }
};

// @desc Get user's friend list and pending requests
// @route GET /api/friends
// @access Private
exports.getNetworkData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username role trustScore')
      .populate('friendRequests', 'username role trustScore');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      friends: user.friends || [],
      friendRequests: user.friendRequests || [],
      myLocation: {
        latitude: user.latitude,
        longitude: user.longitude,
        lastLocationUpdate: user.lastLocationUpdate
      }
    });
  } catch (err) {
    console.error('Get Network Data Error:', err);
    res.status(500).json({ message: 'Failed to load network data', error: err.message });
  }
};

// @desc Accept friend request
// @route POST /api/friends/accept/:senderId
// @access Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;

    if (req.user.role === 'authority') {
      return res.status(403).json({ message: 'Authority accounts cannot accept friend requests.' });
    }

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!senderUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    currentUser.friendRequests = (currentUser.friendRequests || []).filter(
      (id) => id.toString() !== senderId.toString()
    );

    if (!currentUser.friends.includes(senderId)) {
      currentUser.friends.push(senderId);
    }
    if (!senderUser.friends.includes(currentUserId)) {
      senderUser.friends.push(currentUserId);
    }

    await currentUser.save();
    await senderUser.save();

    await Notification.create({
      recipient: senderUser._id,
      sender: currentUserId,
      type: 'friend_accepted',
      title: '🤝 Friend Request Accepted',
      message: `${currentUser.username} accepted your friend request.`
    });

    res.status(200).json({ 
      message: `You are now friends with ${senderUser.username}!` 
    });
  } catch (err) {
    console.error('Accept Friend Error:', err);
    res.status(500).json({ message: 'Failed to accept friend request', error: err.message });
  }
};

// @desc Reject/Deny friend request
// @route POST /api/friends/reject/:senderId
// @access Private
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUser = await User.findById(req.user._id);

    currentUser.friendRequests = (currentUser.friendRequests || []).filter(
      (id) => id.toString() !== senderId.toString()
    );
    await currentUser.save();

    res.status(200).json({ message: 'Friend request declined.' });
  } catch (err) {
    console.error('Reject Friend Error:', err);
    res.status(500).json({ message: 'Failed to decline friend request', error: err.message });
  }
};

// @desc Update user location
// @route PUT /api/friends/location
// @access Private
exports.updateLocationAndStatus = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const updateData = { lastLocationUpdate: new Date() };

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true })
      .select('username latitude longitude lastLocationUpdate');

    res.status(200).json({ message: 'Location updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update Location Error:', err);
    res.status(500).json({ message: 'Failed to update location', error: err.message });
  }
};