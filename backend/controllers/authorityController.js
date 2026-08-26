const Report = require('../models/Report');
const User = require('../models/User'); // Import User model

exports.getAuthorityReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};
    const reports = await Report.find(filter)
      .populate('postedBy', 'username email role trustScore')
      .sort({ votes: -1, createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching authority records', error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVerified } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found in database' });
    }

    report.verificationStatus = status || (isVerified ? 'verified' : report.verificationStatus);
    if (typeof isVerified !== 'undefined') {
      report.isVerified = isVerified;
    }
    await report.save();

    // Reward +5 points if marked as verified
    if ((status === 'verified' || isVerified === true) && report.postedBy && !report.isAnonymous) {
      await User.findByIdAndUpdate(report.postedBy, { $inc: { trustScore: 5 } });
    }

    res.json(report);
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(400).json({ message: 'Error updating report status', error: err.message });
  }
};