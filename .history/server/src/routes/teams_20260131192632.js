const express = require('express');
const { auth, authorizeRole } = require('../middleware/auth');
const Team = require('../models/Team');
const User = require('../models/User');

const router = express.Router();

// Create a team
router.post('/create', auth, authorizeRole('Manager', 'Admin'), async (req, res) => {
  try {
    const { name, companyId, description } = req.body;
    const managerId = req.userId;

    const team = new Team({
      name,
      companyId,
      managerId,
      description: description || '',
      members: [managerId],
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team details
router.get('/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate('managerId', '-password')
      .populate('members', 'name email role');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's teams
router.get('/user/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({ members: req.userId })
      .populate('managerId', '-password')
      .populate('members', 'name email role');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
