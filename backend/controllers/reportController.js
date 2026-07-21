const Report = require('../models/Report');
const { calculateExpiresAt } = require('../models/Expiration');

const createReport = async (req, res) => {
  const { title, description, imageUrl, category, severity, isAnonymous, location } = req.body;
  try {
    const report = await Report.create({ 
      postedBy: req.user._id, 
      title, 
      description, 
      imageUrl, 
      category, 
      severity, 
      isAnonymous: !!isAnonymous,
      expiresAt: calculateExpiresAt(category, severity),
      location: location?.lat && location?.lng ? location : undefined
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const { severity } = req.query;
    const filter = { isDeleted: false, expiresAt: { $gt: new Date() } };
    if (severity) filter.severity = severity;

    const reports = await Report.find(filter)
      .populate('postedBy', 'username role')
      .sort({ createdAt: -1 });

    const viewerRole = req.user?.role;

    const hidden = reports.map((report) => {
      const obj = report.toObject();
      if (obj.isAnonymous && viewerRole !== 'authority') {
        obj.postedBy = { username: 'Anonymous', role: null}
      }
      return obj;
    });

    res.json(hidden);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const voteReport = async (req, res) => {
  const { voteType } = req.body;
  const userId = req.user._id;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.upvotes = report.upvotes.filter(id => id.toString() !== userId.toString());
    report.downvotes = report.downvotes.filter(id => id.toString() !== userId.toString());

    if (voteType === 'upvote') report.upvotes.push(userId);
    if (voteType === 'downvote') report.downvotes.push(userId);

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const commentReport = async (req, res) => {
  const { text } = req.body;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.comments.push({ user: req.user._id, username: req.user.username, text });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const flagReport = async (req, res) => {
  const { flag } = req.body;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.moderatorFlag = flag;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyReport = async (req, res) => {
  const { status } = req.body;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.authorityStatus = status;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  const { reason } = req.body; // optional: 'irrelevant' | 'resolved' | 'privacy' | 'other'
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const isOwner = report.postedBy.toString() === req.user._id.toString();
    const isPrivileged = ['moderator', 'authority'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    report.isDeleted = true;
    report.deletedBy = req.user._id;
    report.deletedAt = new Date();
    report.deleteReason = reason || 'other';

    await report.save();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getReports, voteReport, commentReport, flagReport, verifyReport, deleteReport };