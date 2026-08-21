const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/share-location', async (req, res) => {
  try {
    const { lat, lng, latitude, longitude, userId } = req.body;
    const finalLat = lat !== undefined ? lat : latitude;
    const finalLng = lng !== undefined ? lng : longitude;

    if (finalLat === undefined || finalLng === undefined) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    const targetUserId = userId || req.body._id;

    if (targetUserId) {
      await User.findByIdAndUpdate(targetUserId, {
        latitude: finalLat,
        longitude: finalLng,
        lastLocationUpdate: new Date()
      });
    } else {
      await User.findOneAndUpdate({}, {
        latitude: finalLat,
        longitude: finalLng,
        lastLocationUpdate: new Date()
      });
    }

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});
router.get('/friends-locations', async (req, res) => {
  try {
    const users = await User.find({
      latitude: { $exists: true, $ne: null }
    }).select('username email latitude longitude lastLocationUpdate');

    res.json(users);
  } catch (err) {
    console.error('Error fetching friends locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

module.exports = router;