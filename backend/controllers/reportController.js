const Report = require('../models/Report');

// @desc    Create a new report (Supports both Logged-in & Anonymous)
// @route   POST /api/reports
// @access  Public
const createReport = async (req, res) => {
  try {
    const { title, description, category, severity, location, imageUrl, expiresAt } = req.body;

    // Assign user ID if authenticated, otherwise set to null for anonymous users
    const userId = req.user ? req.user._id : null;

    const report = await Report.create({
      title,
      description,
      category,
      severity,
      location,
      imageUrl,
      postedBy: userId,
      isAnonymous: !userId,
      ...(expiresAt && { expiresAt }),
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all active and non-expired reports
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      isDeleted: false,
      expiresAt: { $gt: new Date() } // Filter out expired reports automatically
    })
      .populate('postedBy', 'name email')
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

    const comment = {
      text,
      user: req.user ? req.user._id : null,
      username: req.user ? req.user.name : 'Anonymous',
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

// @desc    Delete a report (Soft Delete)
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.isDeleted = true;
    report.deletedBy = req.user ? req.user._id : null;
    report.deletedAt = new Date();
    await report.save();

    res.status(200).json({ id: req.params.id, message: 'Report removed' });
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
  deleteReport,
};