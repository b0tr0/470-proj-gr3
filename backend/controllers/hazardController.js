const Hazard = require('../models/Hazard');
const { calculateHazardExpiresAt } = require('../models/Expiration');

const createHazard = async (req, res) => {
    const { type, severity, description, location } = req.body;
    try {
        if (!location?.lat || !location?.lng) {
            return res.status(400).json({ message: 'Location is required for a hazard report.' });
        }

        const hazard = await Hazard.create({
            reportedBy: req.user._id,
            type,
            severity, 
            description,
            location,
            expiresAt: calculateHazardExpiresAt(type, severity)
        });

        const populated = await hazard.populate('reportedBy', 'username role');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHazards = async (req, res) => {
    try {
        const hazards = await Hazard.find({
            isDeleted: false,   // fixed: capital D, matches the schema field name
            expiresAt: { $gt: new Date() }
        })
            .populate('reportedBy', 'username role')
            .sort({ createdAt: -1 });
        res.json(hazards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const voteHazard = async (req, res) => {
    const { voteType } = req.body;
    const userId = req.user._id;
    try { 
        const hazard = await Hazard.findById(req.params.id);
        if (!hazard) return res.status(404).json({ message: 'Hazard not found' });

        hazard.upvotes = hazard.upvotes.filter(id => id.toString() !== userId.toString());
        hazard.downvotes = hazard.downvotes.filter(id => id.toString() !== userId.toString());

        if (voteType === 'upvote') hazard.upvotes.push(userId);
        if (voteType === 'downvote') hazard.downvotes.push(userId);

        await hazard.save();
        res.json(hazard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteHazard = async (req, res) => {
    try {
        const hazard = await Hazard.findById(req.params.id);
        if (!hazard) return res.status(404).json({ message: 'Hazard not found' });

        const isOwner = hazard.reportedBy.toString() === req.user._id.toString();
        const isPrivileged = ['moderator', 'authority'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({ message: 'Not authorized to delete this hazard' });
        }

        hazard.isDeleted = true;
        await hazard.save();
        res.json({ message: 'Hazard removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createHazard, getHazards, voteHazard, deleteHazard }