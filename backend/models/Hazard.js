const mongoose = require('mongoose');

const hazardSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: 'true' },
    type: {
        type: String,
        enum: ['pothole', 'checkpoint', 'extortion', 'poor_road,', 'other'],
        required: true 
    },
    severity: {
        type: String,
        enum: ['moderate', 'high', 'severe'],
        default: 'moderate'
    },
    description: { type: String, required: true },
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true}
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hazard', hazardSchema);