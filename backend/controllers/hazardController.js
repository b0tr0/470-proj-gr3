const Hazard = require('../models/Hazard');

// Helper fallback for expiration if Expiration model is unavailable
let calculateHazardExpiresAt;
try {
  calculateHazardExpiresAt = require('../models/Expiration').calculateHazardExpiresAt;
} catch {
  calculateHazardExpiresAt = () => new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hr default
}

const createHazard = async (req, res) => {
  const { type, severity, description, location } = req.body;
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    if (!location?.lat || !location?.lng) {
      return res.status(400).json({ message: 'Location is required for a hazard report.' });
    }

    const computedExpiresAt = typeof calculateHazardExpiresAt === 'function'
      ? calculateHazardExpiresAt(type, severity)
      : new Date(Date.now() + 1 * 60 * 60 * 1000);

    const hazard = await Hazard.create({
      reportedBy: userId,
      type: type || 'other',
      severity: severity || 'moderate',
      description: description || '',
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng)
      },
      expiresAt: computedExpiresAt
    });

    const populated = await hazard.populate('reportedBy', 'username role');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Hazard Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getHazards = async (req, res) => {
  try {
    const hazards = await Hazard.find({
      isDeleted: false,
      expiresAt: { $gt: new Date() }
    })
      .populate('reportedBy', 'username role')
      .sort({ createdAt: -1 });
    res.status(200).json(hazards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const voteHazard = async (req, res) => {
  const { voteType } = req.body;
  const userId = req.user?._id || req.user?.id;
  try {
    const hazard = await Hazard.findById(req.params.id);
    if (!hazard) return res.status(404).json({ message: 'Hazard not found' });

    hazard.upvotes = (hazard.upvotes || []).filter(id => id.toString() !== userId.toString());
    hazard.downvotes = (hazard.downvotes || []).filter(id => id.toString() !== userId.toString());

    if (voteType === 'upvote') hazard.upvotes.push(userId);
    if (voteType === 'downvote') hazard.downvotes.push(userId);

    await hazard.save();
    res.status(200).json(hazard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHazard = async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id);
    if (!hazard) return res.status(404).json({ message: 'Hazard not found' });

    const currentUserId = (req.user?._id || req.user?.id || '').toString();
    const userRole = (req.user?.role || req.user?.userType || '').toLowerCase().trim();

    const authorId = (hazard.reportedBy?._id || hazard.reportedBy || '').toString();
    const isOwner = Boolean(currentUserId && authorId === currentUserId);
    const isPrivileged = ['moderator', 'authority', 'community moderator', 'admin'].includes(userRole);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to delete this hazard' });
    }

    hazard.isDeleted = true;
    await hazard.save();
    res.status(200).json({ id: req.params.id, message: 'Hazard removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createHazard, getHazards, voteHazard, deleteHazard };