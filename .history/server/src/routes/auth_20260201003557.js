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

    // Create user first (without team assigned yet)
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      teamId: null,
    });

    await user.save();

    // Determine team assignment: prefer provided teamId, else existing team, else create default team
    let assignedTeamId = teamId || null;

    if (!assignedTeamId) {
      const firstTeam = await Team.findOne();
      if (firstTeam) {
        assignedTeamId = firstTeam._id;
      } else {
        // No team exists yet — create a default team and assign a manager
        let managerForTeam = null;
        if ((role || 'Employee') === 'Manager') {
          managerForTeam = user._id;
        } else {
          // try to find an Admin to be manager, otherwise use this user as manager
          const adminUser = await require('../models/User').findOne({ role: 'Admin' });
          managerForTeam = adminUser ? adminUser._id : user._id;
        }

        const defaultTeam = new Team({
          name: 'General Team',
          companyId: `atmos-default-${Date.now()}`,
          managerId: managerForTeam,
          members: [user._id],
          description: 'Auto-created default team',
        });

        await defaultTeam.save();
        assignedTeamId = defaultTeam._id;
        // If managerForTeam equals user._id and user.role was Manager, ensure user is marked as manager in team
      }
    }

    // update user's teamId and ensure membership
    if (assignedTeamId) {
      user.teamId = assignedTeamId;
      await user.save();
      await Team.findByIdAndUpdate(assignedTeamId, { $addToSet: { members: user._id } });
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
