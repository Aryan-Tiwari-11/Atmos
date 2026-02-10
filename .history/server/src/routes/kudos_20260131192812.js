const express = require('express');
const { auth, authorizeRole } = require('../middleware/auth');
const Kudos = require('../models/Kudos');
const User = require('../models/User');
const Team = require('../models/Team');

const router = express.Router();

// Submit a Kudos
router.post('/submit', auth, async (req, res) => {
  try {
    const { toUserId, message, isAnonymous } = req.body;
    const fromUserId = req.userId;
    const teamId = req.teamId;

    if (!toUserId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const kudos = new Kudos({
      fromUserId,
      toUserId,
      teamId,
      message,
      isAnonymous: isAnonymous !== false,
    });

    await kudos.save();
    await kudos.populate('fromUserId toUserId', '-password');

    res.status(201).json(kudos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all Kudos for a team
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;

    const kudosData = await Kudos.find({ teamId })
      .populate('fromUserId toUserId', '-password')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(kudosData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
