// Script to assign a user (by email) to the first available team
// Usage: node assignTeamToUser.js user@example.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Team = require('./src/models/Team');

async function assign(email) {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/atmos';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    const team = await Team.findOne();
    if (!team) {
      console.error('No team found in database. Please create a team first.');
      process.exit(1);
    }

    user.teamId = team._id;
    await user.save();

    // Ensure user is in team's members array
    if (!team.members.some((m) => m.equals(user._id))) {
      team.members.push(user._id);
      await team.save();
    }

    console.log(`Assigned user ${email} to team ${team.name} (${team._id})`);
    process.exit(0);
  } catch (err) {
    console.error('Error assigning team:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node assignTeamToUser.js user@example.com');
    process.exit(1);
  }
  assign(email);
}

module.exports = assign;
