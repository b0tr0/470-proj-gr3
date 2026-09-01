const FuelStatus = require('../models/FuelStatus');
const { calculateFuelExpiresAt } = require('../models/Expiration');

// GET function
const getFuelStatus = async (req, res) => {
  try {
    const statusList = await FuelStatus.find().sort({ createdAt: -1 });
    res.status(200).json(statusList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST function
const createFuelStatus = async (req, res) => {
  try {
    const { stationName, locationName, fuelType, queueLength, username, lat, lng } = req.body;

    const newFuelStatus = new FuelStatus({
      stationName,
      locationName: locationName || location,
      fuelType,
      queueLength,
      username: username || req.user?.username,
      location: { lat, lng },
      reportedBy: req.user?._id || req.body.reportedBy,
      expiresAt: calculateFuelExpiresAt(queueLength)
    });

    const savedFuelStatus = await newFuelStatus.save();
    res.status(201).json(savedFuelStatus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE function
const deleteFuelStatus = async (req, res) => {
  try {
    const fuelStatus = await FuelStatus.findById(req.params.id);
    if (!fuelStatus) {
      return res.status(404).json({ message: 'Fuel status report not found' });
    }

    const currentUserId = req.user?._id?.toString();
    const userRole = (req.user?.role || req.user?.userType || '').toLowerCase().trim();

    const postAuthorId = (fuelStatus.reportedBy?._id || fuelStatus.reportedBy || '').toString();
    const isAuthor = Boolean(currentUserId && postAuthorId === currentUserId);
    const isPrivileged = ['authority', 'moderator', 'community moderator', 'admin'].includes(userRole);

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to delete this fuel report.' });
    }

    await FuelStatus.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: 'Fuel report deleted successfully' });
  } catch (error) {
    console.error('Delete Fuel Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Properly export named objects
module.exports = {
  getFuelStatus,
  createFuelStatus,
  deleteFuelStatus
};