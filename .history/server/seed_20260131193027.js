// Sample data for testing Atmos
// Run this after starting MongoDB to seed initial data

const mongoose = require('mongoose');

// Models
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Kudos = require('./src/models/Kudos');
const Pulse = require('./src/models/Pulse');
const Question = require('./src/models/Question');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atmos');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Kudos.deleteMany({});
    await Pulse.deleteMany({});
    await Question.deleteMany({});

    // Create test users
    console.log('Creating test users...');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);

    const testUsers = [
      {
        name: 'John Manager',
        email: 'manager@test.com',
        password: await bcrypt.hash('test123', salt),
        role: 'Manager',
      },
      {
        name: 'Jane Employee',
        email: 'employee1@test.com',
        password: await bcrypt.hash('test123', salt),
        role: 'Employee',
      },
      {
        name: 'Bob Employee',
        email: 'employee2@test.com',
        password: await bcrypt.hash('test123', salt),
        role: 'Employee',
      },
      {
        name: 'Alice Admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('test123', salt),
        role: 'Admin',
      },
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log('✓ Created 4 test users');

    // Create a test team
    console.log('Creating test team...');
    const team = new Team({
      name: 'Engineering Team',
      companyId: 'infotact-eng-001',
      managerId: createdUsers[0]._id,
      members: createdUsers.map((u) => u._id),
      description: 'Main engineering team for testing',
    });

    await team.save();
    console.log('✓ Created test team');

    // Update users with team ID
    await User.updateMany(
      { _id: { $in: createdUsers.map((u) => u._id) } },
      { teamId: team._id }
    );

    // Create sample kudos
    console.log('Creating sample kudos...');
    const kudosData = [
      {
        fromUserId: createdUsers[1]._id,
        toUserId: createdUsers[0]._id,
        teamId: team._id,
        message: 'Great job managing the sprint! Your leadership is amazing.',
        isAnonymous: false,
      },
      {
        fromUserId: createdUsers[2]._id,
        toUserId: createdUsers[1]._id,
        teamId: team._id,
        message: 'Thanks for helping me debug that issue yesterday!',
        isAnonymous: true,
      },
    ];

    await Kudos.insertMany(kudosData);
    console.log('✓ Created sample kudos');

    // Create sample pulse checks
    console.log('Creating sample pulse data...');
    const pulseData = [
      { userId: createdUsers[0]._id, teamId: team._id, status: 'Good', notes: '' },
      { userId: createdUsers[1]._id, teamId: team._id, status: 'Light', notes: 'Feeling great today' },
      { userId: createdUsers[2]._id, teamId: team._id, status: 'Heavy', notes: 'Lots of deadlines' },
      { userId: createdUsers[3]._id, teamId: team._id, status: 'Good', notes: '' },
    ];

    await Pulse.insertMany(pulseData);
    console.log('✓ Created sample pulse data');

    // Create sample questions
    console.log('Creating sample Q&A...');
    const questionData = [
      {
        sessionId: 'live-meeting-1',
        teamId: team._id,
        userId: createdUsers[1]._id,
        content: 'When is the next release scheduled?',
        upvotes: 3,
        upvoterIds: [createdUsers[2]._id, createdUsers[3]._id],
      },
      {
        sessionId: 'live-meeting-1',
        teamId: team._id,
        userId: createdUsers[2]._id,
        content: 'Can we get more details on the new feature?',
        upvotes: 2,
        upvoterIds: [createdUsers[1]._id],
        isAnswered: true,
        answer: 'We will share detailed documentation by end of week.',
      },
    ];

    await Question.insertMany(questionData);
    console.log('✓ Created sample Q&A');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Test Accounts:');
    console.log('  Manager: manager@test.com / test123');
    console.log('  Employee: employee1@test.com / test123');
    console.log('  Employee: employee2@test.com / test123');
    console.log('  Admin: admin@test.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = seedDatabase;
