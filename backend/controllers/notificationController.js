const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to calculate distance in km between two GPS coordinates (Haversine formula)
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 1. Send Proximity Alerts to Nearby Users
const sendProximityAlerts = async (report) => {
  try {
    if (!report?.location?.lat || !report?.location?.lng) return;

    const users = await User.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
    });

    const notifications = [];

    for (const user of users) {
      if (report.postedBy && user._id.toString() === report.postedBy.toString()) {
        continue;
      }

      const distance = getDistanceInKm(
        report.location.lat,
        report.location.lng,
        user.latitude,
        user.longitude
      );

      // Within 5km radius
      if (distance <= 5) {
        notifications.push({
          recipient: user._id,
          sender: report.postedBy || null,
          type: 'proximity_alert',
          title: '🚨 Nearby Traffic Hazard!',
          message: `A "${report.title}" was reported ~${distance.toFixed(1)} km away from you.`,
          relatedId: report._id,
          createdAt: new Date(),
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Send Proximity Alerts Error:', error);
  }
};

// 2. Check Upvote Threshold Alert
const checkUpvoteThresholdAlert = async (report) => {
  try {
    const upvotesCount = report.upvotes?.length || 0;
    if (upvotesCount === 5 || upvotesCount === 10 || upvotesCount === 25) {
      if (report.postedBy && !report.isAnonymous) {
        await Notification.create({
          recipient: report.postedBy,
          type: 'trending_report',
          title: '🔥 Trending Report!',
          message: `Your report "${report.title}" has reached ${upvotesCount} upvotes!`,
          relatedId: report._id,
          createdAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('Check Upvote Threshold Error:', error);
  }
};

// 3. Send Vote Notification
const sendVoteNotification = async ({ recipientId, senderId, senderName, actionType, contentType, contentTitle, contentId }) => {
  if (!recipientId || String(recipientId) === String(senderId)) return;
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type: 'vote_received',
      title: `${actionType === 'upvote' ? '👍 Upvote' : '👎 Downvote'} Received`,
      message: `${senderName || 'Someone'} ${actionType}d your ${contentType || 'post'} "${contentTitle || 'traffic alert'}".`,
      relatedId: contentId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Send Vote Notification Error:', error);
  }
};

// 4. Send Comment Notification
const sendCommentNotification = async ({ recipientId, senderId, senderName, contentType, contentTitle, commentText, contentId }) => {
  if (!recipientId || String(recipientId) === String(senderId)) return;
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type: 'comment_received',
      title: '💬 New Comment',
      message: `${senderName || 'Someone'} commented on your ${contentType || 'post'} "${contentTitle}": "${commentText}"`,
      relatedId: contentId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Send Comment Notification Error:', error);
  }
};

// 5. Send Verification Notification
const sendVerificationNotification = async ({ recipientId, senderId, senderName, reportTitle, reportId }) => {
  if (!recipientId) return;
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type: 'report_verified',
      title: '✅ Report Verified by Authority',
      message: `Your report "${reportTitle || 'Traffic Incident'}" was officially verified by ${senderName || 'an Official Authority'}. You earned +5 trust score points!`,
      relatedId: reportId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Send Verification Notification Error:', error);
  }
};

// 6. Send SOS Emergency Alert Notification
const sendSOSNotification = async ({ recipientId, senderId, senderName, note, reportId, lat, lng }) => {
  if (!recipientId || (senderId && String(recipientId) === String(senderId))) return;
  try {
    await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type: 'sos_emergency',
      title: '🚨 EMERGENCY SOS BROADCAST',
      message: `${senderName || 'A driver'} triggered an SOS near (${Number(lat || 0).toFixed(4)}, ${Number(lng || 0).toFixed(4)}): "${note || 'Immediate roadside assistance needed!'}"`,
      relatedId: reportId || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Send SOS Notification Error:', error);
  }
};

// 7. Get User Notifications (REST endpoint)
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// 8. Mark Notification as Read (REST endpoint)
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

module.exports = {
  sendProximityAlerts,
  checkUpvoteThresholdAlert,
  sendVoteNotification,
  sendCommentNotification,
  sendVerificationNotification,
  sendSOSNotification,
  getNotifications,
  getUserNotifications: getNotifications,
  markAsRead,
  markNotificationAsRead: markAsRead,
};