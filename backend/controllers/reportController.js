const Report = require('../models/Report');
const User = require('../models/User');
const { calculateExpiresAt } = require('../models/Expiration');
const { 
  sendProximityAlerts, 
  checkUpvoteThresholdAlert, 
  sendVoteNotification,
  sendCommentNotification,
  sendVerificationNotification 
} = require('./notificationController');

// Helper to safely adjust user trust scores starting from a 100 baseline
const adjustTrustScore = async (userId, delta) => {
  if (!userId) return;
  try {
    const user = await User.findById(userId);
    if (user) {
      const currentScore = typeof user.trustScore === 'number' ? user.trustScore : 100;
      user.trustScore = Math.max(0, currentScore + delta);
      await user.save();
    }
  } catch (err) {
    console.error('Error adjusting trust score:', err);
  }
};

const createReport = async (req, res) => {
  try {
    const { title, description, category, severity, location, lat, lng, imageUrl, expiresAt, isAnonymous } = req.body;

    const locationPayload = (location && typeof location.lat === 'number' && typeof location.lng === 'number')
      ? location
      : (typeof lat === 'number' && typeof lng === 'number')
        ? { lat, lng }
        : undefined;

    const report = await Report.create({
      title,
      description,
      category,
      severity,
      imageUrl,
      postedBy: req.user._id,
      isAnonymous: !!isAnonymous,
      expiresAt: calculateExpiresAt(category, severity),
      upvotes: [],
      downvotes: [],
      votes: 0,
      location: locationPayload
    });

    if (typeof sendProximityAlerts === 'function') {
      sendProximityAlerts(report);
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const now = new Date();
    const nowISO = now.toISOString();

    const reports = await Report.find({
      $and: [
        { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] },
        { isExpired: { $ne: true } },
        { status: { $ne: 'resolved' } },
        { authorityStatus: { $ne: 'resolved' } },
        {
          $or: [
            { expiresAt: { $gt: now } },
            { expiresAt: { $gt: nowISO } },
            { expiresAt: null },
            { expiresAt: { $exists: false } }
          ]
        }
      ]
    })
      .populate('postedBy', 'username email role trustScore')
      .sort({ createdAt: -1 });

    // In-memory safety guard
    const activeReports = reports.filter((r) => {
      if (r.isDeleted === true || r.isExpired === true) return false;
      if (r.status === 'resolved' || r.authorityStatus === 'resolved') return false;
      if (!r.expiresAt) return true;
      return new Date(r.expiresAt).getTime() > now.getTime();
    });

    res.status(200).json(activeReports);
  } catch (error) {
    console.error('Get Reports Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const voteReport = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'You must be logged in to vote.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.upvotes = report.upvotes || [];
    report.downvotes = report.downvotes || [];

    const targetAuthorId = report.postedBy;
    const hasUpvoted = report.upvotes.some((id) => id.toString() === userId.toString());
    const hasDownvoted = report.downvotes.some((id) => id.toString() === userId.toString());

    if (type === 'upvote') {
      if (hasUpvoted) {
        report.upvotes = report.upvotes.filter((id) => id.toString() !== userId.toString());
        if (targetAuthorId && !report.isAnonymous) {
          await adjustTrustScore(targetAuthorId, -1);
        }
      } else {
        report.upvotes.push(userId);
        let trustDelta = 1;
        if (hasDownvoted) {
          report.downvotes = report.downvotes.filter((id) => id.toString() !== userId.toString());
          trustDelta = 2;
        }
        if (targetAuthorId && !report.isAnonymous) {
          await adjustTrustScore(targetAuthorId, trustDelta);

          sendVoteNotification({
            recipientId: targetAuthorId,
            senderId: userId,
            senderName: req.user?.username,
            actionType: 'upvote',
            contentType: 'report',
            contentTitle: report.title,
            contentId: report._id
          });
        }

        if (typeof checkUpvoteThresholdAlert === 'function') {
          checkUpvoteThresholdAlert(report);
        }
      }
    } else if (type === 'downvote') {
      if (hasDownvoted) {
        report.downvotes = report.downvotes.filter((id) => id.toString() !== userId.toString());
        if (targetAuthorId && !report.isAnonymous) {
          await adjustTrustScore(targetAuthorId, 1);
        }
      } else {
        report.downvotes.push(userId);
        let trustDelta = -1;
        if (hasUpvoted) {
          report.upvotes = report.upvotes.filter((id) => id.toString() !== userId.toString());
          trustDelta = -2;
        }
        if (targetAuthorId && !report.isAnonymous) {
          await adjustTrustScore(targetAuthorId, trustDelta);

          sendVoteNotification({
            recipientId: targetAuthorId,
            senderId: userId,
            senderName: req.user?.username,
            actionType: 'downvote',
            contentType: 'report',
            contentTitle: report.title,
            contentId: report._id
          });
        }
      }
    }

    report.votes = report.upvotes.length - report.downvotes.length;
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('postedBy', 'username email role trustScore');

    res.status(200).json(populatedReport);
  } catch (error) {
    console.error('Vote Report Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const commentReport = async (req, res) => {
  try {
    const { text } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const authorName = req.user ? (req.user.username || req.user.name) : 'Anonymous';

    report.comments.push({
      text,
      user: req.user ? req.user._id : null,
      username: authorName,
      createdAt: new Date(),
    });

    await report.save();

    if (report.postedBy && !report.isAnonymous) {
      sendCommentNotification({
        recipientId: report.postedBy,
        senderId: req.user ? req.user._id : null,
        senderName: authorName,
        contentType: 'report',
        contentTitle: report.title,
        commentText: text,
        contentId: report._id
      });
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Comment Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const voteComment = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'You must be logged in to vote on comments.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const comment = report.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.upvotes = comment.upvotes || [];
    comment.downvotes = comment.downvotes || [];

    const hasUpvoted = comment.upvotes.some((id) => id.toString() === userId.toString());
    const hasDownvoted = comment.downvotes.some((id) => id.toString() === userId.toString());

    if (type === 'upvote') {
      if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId.toString());
      } else {
        comment.upvotes.push(userId);
        if (hasDownvoted) {
          comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId.toString());
        }
      }
    } else if (type === 'downvote') {
      if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId.toString());
      } else {
        comment.downvotes.push(userId);
        if (hasUpvoted) {
          comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId.toString());
        }
      }
    }

    comment.votes = (comment.upvotes ? comment.upvotes.length : 0) - (comment.downvotes ? comment.downvotes.length : 0);
    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('postedBy', 'username email role trustScore');

    res.status(200).json(populatedReport);
  } catch (error) {
    console.error('Vote Comment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Flag a report
// @route   PUT /api/reports/:id/flag
// @access  Private/Moderator
const flagReport = async (req, res) => {
  try {
    const { flagType } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.moderatorFlag = flagType || 'false/misleading';
    await report.save();

    if (report.postedBy && !report.isAnonymous) {
      await adjustTrustScore(report.postedBy, -5);
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Flag Report Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const verifyReport = async (req, res) => {
  try {
    const { status } = req.body;
    const userRole = (req.user?.role || '').toLowerCase().trim();

    // Block moderators from verifying
    if (!['authority', 'admin'].includes(userRole)) {
      return res.status(403).json({ 
        message: 'Unauthorized! Only official authority accounts can verify reports.' 
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const wasUnverified = report.authorityStatus !== 'verified';
    report.authorityStatus = status || 'verified';
    await report.save();

    // Award +5 trust points and send notification to original author
    if (wasUnverified && report.postedBy && !report.isAnonymous) {
      await adjustTrustScore(report.postedBy, 5);

      if (typeof sendVerificationNotification === 'function') {
        await sendVerificationNotification({
          recipientId: report.postedBy,
          senderId: req.user?._id,
          senderName: req.user?.username || 'Authority',
          reportTitle: report.title,
          reportId: report._id
        });
      }
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Verify Report Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { status } = req.body;
    const userRole = (req.user?.role || '').toLowerCase().trim();

    // Block moderators from marking resolved
    if (!['authority', 'admin'].includes(userRole)) {
      return res.status(403).json({ 
        message: 'Unauthorized! Only official authority accounts can resolve reports.' 
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.authorityStatus = status || 'resolved';
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    console.error('Resolve Report Error:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const currentUserId = req.user?._id?.toString();
    const userRole = (req.user?.role || '').toLowerCase().trim();

    const postAuthorId = (report.postedBy?._id || report.postedBy || '').toString();
    const isAuthor = currentUserId && postAuthorId === currentUserId;
    const isPrivileged = ['authority', 'moderator', 'community moderator', 'admin'].includes(userRole);

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to delete this report.' });
    }

    const deleteReason = req.body?.deleteReason || req.query?.deleteReason;
    if (deleteReason) {
      report.isDeleted = true;
      report.deletedBy = req.user._id;
      report.deletedAt = new Date();
      report.deleteReason = deleteReason;
      if (deleteReason === 'resolved') {
        report.authorityStatus = 'resolved';
      }
      await report.save();
    } else {
      await Report.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ id: req.params.id, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  voteReport,
  commentReport,
  voteComment,
  flagReport,
  verifyReport,
  resolveReport,
  deleteReport,
};