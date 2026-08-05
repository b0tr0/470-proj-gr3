const mongoose = require('mongoose');

const fuelStatusSchema = new mongoose.Schema({
  stationName: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    // Updated enum values to match front-end dropdown options
    enum: ['Available', 'Long Queue Present', 'Out of Fuel', 'available', 'long line', 'out of fuel'], 
    required: true 
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false, // Set to false to support anonymous submissions
    default: null 
  },
  // Simple coordinates array [longitude, latitude]
  coordinates: {
    type: [Number], 
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FuelStatus', fuelStatusSchema);