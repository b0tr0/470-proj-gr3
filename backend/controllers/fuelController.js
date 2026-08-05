const FuelStatus = require('../models/fuelStatus');

// @desc    Create a new fuel status update
// @route   POST /api/fuel
// @access  Public (Supports Anonymous & Authenticated)
const createFuelStatus = async (req, res) => {
  try {
    const { stationName, status, coordinates, latitude, longitude } = req.body;

    // Handle coordinates whether sent as an array or individual lat/lng
    let finalCoordinates = coordinates;
    if (!finalCoordinates && latitude && longitude) {
      finalCoordinates = [parseFloat(longitude), parseFloat(latitude)];
    }

    // Validation check for basic fields
    if (!stationName || !status || !finalCoordinates) {
      return res.status(400).json({ 
        message: 'Please provide station name, status, and coordinates' 
      });
    }

    // Safely extract user ID if authenticated, or set to null if anonymous
    const reportedBy = req.user ? req.user._id : null;

    const newFuelStatus = await FuelStatus.create({
      stationName,
      status,
      coordinates: finalCoordinates,
      reportedBy,
    });

    res.status(201).json(newFuelStatus);
  } catch (error) {
    console.error('Error creating fuel status:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all fuel statuses
// @route   GET /api/fuel
// @access  Public
const getFuelStatuses = async (req, res) => {
  try {
    const statuses = await FuelStatus.find()
      .populate('reportedBy', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(statuses);
  } catch (error) {
    console.error('Error fetching fuel statuses:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

module.exports = {
  createFuelStatus,
  getFuelStatuses,
};