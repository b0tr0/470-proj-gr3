const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc Send a private direct message
// @route POST /api/chat/send
// @access Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Recipient and message text are required.' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text: text.trim()
    });

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'username')
      .populate('recipient', 'username');

    // Create a notification for the recipient
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'general',
      title: `💬 Message from ${req.user.username}`,
      message: text.trim().slice(0, 50) + (text.length > 50 ? '...' : '')
    });

    res.status(201).json(populatedMsg);
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// @desc Get direct chat history between current user and a friend
// @route GET /api/chat/conversation/:friendId
// @access Private
exports.getConversation = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: friendId },
        { sender: friendId, recipient: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: friendId, recipient: currentUserId, isRead: false },
      { isRead: true }
    );

    res.status(200).json(messages);
  } catch (err) {
    console.error('Get Conversation Error:', err);
    res.status(500).json({ message: 'Failed to load conversation', error: err.message });
  }
};