const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc Trigger an SOS Emergency Distress Alert
// @route POST /api/sos
// @access Private
exports.triggerSOS = async (req, res) => {
  try {
    const { lat, lng, emergencyNote } = req.body;
    const userId = req.user._id;
    const sender = await User.findById(userId).populate('friends', '_id');

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Automatically create a high-priority incident report on the feed
    const sosReport = await Report.create({
      title: `🚨 SOS EMERGENCY: ${sender.username}`,
      description: emergencyNote || `Urgent assistance requested by ${sender.username} at live location!`,
      category: 'accident',
      severity: 'severe',
      postedBy: userId,
      isAnonymous: false,
      location: { lat, lng }
    });

    const notificationsToInsert = [];
    const notifiedRecipientIds = new Set();

    // 2. Alert user's registered network friends
    if (sender.friends && sender.friends.length > 0) {
      sender.friends.forEach((friend) => {
        const friendIdStr = friend._id.toString();
        notifiedRecipientIds.add(friendIdStr);
        notificationsToInsert.push({
          recipient: friend._id,
          sender: userId,
          type: 'sos_emergency',
          title: `🚨 EMERGENCY: Friend in Distress!`,
          message: `${sender.username} has triggered an SOS alert near you. Check live location immediately!`,
          location: { lat, lng },
          relatedReport: sosReport._id
        });
      });
    }

    // 3. Alert all official Authority accounts
    const authorities = await User.find({
      role: { $in: ['authority', 'moderator', 'admin'] }
    });

    authorities.forEach((auth) => {
      const authIdStr = auth._id.toString();
      if (!notifiedRecipientIds.has(authIdStr) && authIdStr !== userId.toString()) {
        notifiedRecipientIds.add(authIdStr);
        notificationsToInsert.push({
          recipient: auth._id,
          sender: userId,
          type: 'sos_emergency',
          title: `🚨 SOS DISPATCH: Citizen Emergency`,
          message: `Distress beacon from ${sender.username} at [Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}].`,
          location: { lat, lng },
          relatedReport: sosReport._id
        });
      }
    });

    // 4. Alert nearby citizens within 5 km if coordinates exist
    if (lat && lng) {
      const nearbyUsers = await User.find({
        latitude: { $ne: null },
        longitude: { $ne: null },
        _id: { $ne: userId }
      });

      nearbyUsers.forEach((u) => {
        const uIdStr = u._id.toString();
        if (!notifiedRecipientIds.has(uIdStr)) {
          const dist = calculateDistanceKm(lat, lng, u.latitude, u.longitude);
          if (dist <= 5.0) {
            notifiedRecipientIds.add(uIdStr);
            notificationsToInsert.push({
              recipient: u._id,
              sender: userId,
              type: 'sos_emergency',
              title: `🚨 SOS ALERT Nearby (${dist.toFixed(1)} km away)`,
              message: `${sender.username} requested immediate assistance nearby!`,
              location: { lat, lng },
              relatedReport: sosReport._id
            });
          }
        }
      });
    }

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    res.status(201).json({
      message: 'SOS Alert dispatched successfully to friends, authorities, and nearby citizens.',
      report: sosReport,
      totalNotified: notificationsToInsert.length
    });
  } catch (err) {
    console.error('SOS dispatch error:', err);
    res.status(500).json({ message: 'Failed to broadcast SOS emergency', error: err.message });
  }
};