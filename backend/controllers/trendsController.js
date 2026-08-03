const Report = require('../models/Report');

exports.getMonthlyTrends = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const trends = await Report.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, category: '$category' },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ year, trends });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trends', error: err.message });
  }
};