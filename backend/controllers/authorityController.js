const Report = require('../models/Report');

exports.getAuthorityReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};
    const reports = await Report.find(filter).sort({ votes: -1, createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching authority records', error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { verificationStatus: status },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found in database' });
    }

    res.json(updatedReport);
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(400).json({ message: 'Error updating report status', error: err.message });
  }
};