const FuelStatus = require('../models/FuelStatus');

const reportFuel = async (req, res) => {
    const { stationName, status, coordinates } = req.body;
    try {
        // The if-statement checking for coordinates has been removed entirely
        const fuelUpdate = await FuelStatus.create({
            stationName,
            status,
            coordinates: coordinates || [], // Fallback to an empty array if not provided
            reportedBy: req.user._id
        });
        res.status(201).json(fuelUpdate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFuelStatuses = async (req, res) => {
    try {
        const statuses = await FuelStatus.find().populate('reportedBy', 'username').sort({ createdAt: -1 });
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { reportFuel, getFuelStatuses };