const express = require('express');
const { auth, authorizeRole } = require('../middleware/auth');
const Pulse = require('../models/Pulse');
const Team = require('../models/Team');

const router = express.Router();

// Submit a pulse check
router.post('/submit', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const userId = req.userId;
    let teamId = req.teamId;

    if (!status || !['Light', 'Good', 'Heavy'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // If user doesn't have a teamId, find their primary team
    if (!teamId) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user && user.teamId) {
        teamId = user.teamId;
      } else {
        return res.status(400).json({ message: 'User must be assigned to a team' });
      }
    }

    const pulse = new Pulse({
      userId,
      teamId,
      status,
      notes: notes || '',
    });

    await pulse.save();
    res.status(201).json(pulse);
  } catch (error) {
    console.error('Pulse submit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pulse aggregation for a team (Manager only)
router.get('/team/:teamId/aggregated', auth, authorizeRole('Manager', 'Admin'), async (req, res) => {
  try {
    const { teamId } = req.params;

    // Verify manager has access to this team
    if (req.userRole === 'Manager' && req.teamId !== teamId) {
      return res.status(403).json({ message: 'You do not have access to this team' });
    }

    const pulseData = await Pulse.find({ teamId }).select('status createdAt');

    const aggregation = {
      Light: 0,
      Good: 0,
      Heavy: 0,
      total: pulseData.length,
    };

    pulseData.forEach((p) => {
      aggregation[p.status]++;
    });

    const percentages = {
      Light: aggregation.total > 0 ? Math.round((aggregation.Light / aggregation.total) * 100) : 0,
      Good: aggregation.total > 0 ? Math.round((aggregation.Good / aggregation.total) * 100) : 0,
      Heavy: aggregation.total > 0 ? Math.round((aggregation.Heavy / aggregation.total) * 100) : 0,
    };

    res.json({ counts: aggregation, percentages, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
