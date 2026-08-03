const mongoose = require('mongoose');

const fuelStatusSchema = new mongoose.Schema({
  stationName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'long line', 'out of fuel'], 
    required: true 
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Simple coordinates array [longitude, latitude]
  coordinates: {
    type: [Number], 
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FuelStatus', fuelStatusSchema);