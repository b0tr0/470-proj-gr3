const mongoose = require('mongoose');

const fuelStatusSchema = new mongoose.Schema({
  stationName: { type: String, required: true },
  locationName: { type: String, required: true }, // Added to store area/location name
  fuelType: { type: String }, // Added to store fuel category
  queueLength: { type: String }, // Added to sync queue length status
  status: { 
    type: String, 
    enum: ['available', 'long line', 'out of fuel'], 
    default: 'available' 
  },
  coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, default: 'Registered Member' }, // Direct fallback username storage
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FuelStatus', fuelStatusSchema);