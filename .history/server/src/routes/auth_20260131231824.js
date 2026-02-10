const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, teamId } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If no teamId provided, try to assign to first available team
    let assignedTeamId = teamId;
    if (!assignedTeamId) {
      const firstTeam = await Team.findOne();
      if (firstTeam) {
        assignedTeamId = firstTeam._id;
      }
    }

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      teamId: assignedTeamId,
    });

    await user.save();

    if (assignedTeamId) {
      await Team.findByIdAndUpdate(assignedTeamId, { $push: { members: user._id } });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      teamId: user.teamId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      teamId: user.teamId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
