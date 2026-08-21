const Report = require('../models/Report');

// @desc    Create a new report (Supports both Logged-in & Anonymous)
// @route   POST /api/reports
// @access  Public/Private
const createReport = async (req, res) => {
  try {
    const { title, description, category, severity, location, imageUrl, expiresAt, isAnonymous } = req.body;

    const userId = req.user ? req.user._id : null;
    const anonymousPost = typeof isAnonymous !== 'undefined' ? isAnonymous : !userId;

    const report = await Report.create({
      title,
      description,
      category,
      severity,
      location,
      imageUrl,
      postedBy: userId,
      isAnonymous: anonymousPost,
      ...(expiresAt && { expiresAt }),
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all active non-deleted reports
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
    })
      .populate('postedBy', 'username email role')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a report
// @route   PUT /api/reports/:id/vote
// @access  Private
const voteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user && !report.upvotes.includes(req.user._id)) {
      report.upvotes.push(req.user._id);
      await report.save();
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Comment on a report
// @route   POST /api/reports/:id/comment
// @access  Private/Public
const commentReport = async (req, res) => {
  try {
    const { text } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const authorName = req.user ? (req.user.username || req.user.name) : 'Anonymous';

    const comment = {
      text,
      user: req.user ? req.user._id : null,
      username: authorName,
      createdAt: new Date(),
    };

    report.comments.push(comment);
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify a report
// @route   PUT /api/reports/:id/verify
// @access  Private/Authority
const verifyReport = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.authorityStatus = status || 'verified';
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🟢 NEW: Resolve a report
// @desc    Resolve a report
// @route   PUT or PATCH /api/reports/:id/resolve
// @access  Private/Authority
const resolveReport = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.authorityStatus = status || 'resolved';
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a report (Hard Delete to completely remove from Database)
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ id: req.params.id, message: 'Report deleted permanently' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  voteReport,
  commentReport,
  flagReport,
  verifyReport,
  resolveReport,
  deleteReport,
};