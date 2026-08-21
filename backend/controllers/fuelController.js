const FuelStatus = require('../models/fuelstatus');

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
    const { stationName, locationName, location, fuelType, queueLength, status, username } = req.body;

    const newFuelStatus = new FuelStatus({
      stationName,
      locationName: locationName || location,
      fuelType,
      queueLength,
      status,
      username: username || req.user?.username,
      reportedBy: req.user?._id || req.body.reportedBy
    });

    const savedFuelStatus = await newFuelStatus.save();
    res.status(201).json(savedFuelStatus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Properly export named objects
module.exports = {
  getFuelStatus,
  createFuelStatus
};