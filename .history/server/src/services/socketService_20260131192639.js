const Kudos = require('../models/Kudos');
const Question = require('../models/Question');

const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on('join_room', (data) => {
      const { userId, teamId, roomType } = data;
      const roomName = `${roomType}_${teamId}`;

      socket.join(roomName);
      console.log(`User ${userId} joined room: ${roomName}`);

      // Notify others in the room
      io.to(roomName).emit('user_joined', {
        userId,
        roomName,
        timestamp: new Date(),
      });
    });

    // Kudos event
    socket.on('new_kudos', async (data) => {
      try {
        const { teamId, kudosId } = data;
        const roomName = `company-feed_${teamId}`;

        const kudos = await Kudos.findById(kudosId).populate('fromUserId toUserId', '-password');

        io.to(roomName).emit('new_kudos', {
          kudos,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error broadcasting kudos:', error);
      }
    });

    // Pulse update event
    socket.on('pulse_submitted', (data) => {
      const { teamId, status } = data;
      const roomName = `manager-dashboard_${teamId}`;

      io.to(roomName).emit('pulse_update', {
        status,
        timestamp: new Date(),
      });
    });

    // Q&A events
    socket.on('new_question', async (data) => {
      try {
        const { sessionId, teamId, questionId } = data;
        const roomName = `qa-session_${sessionId}`;

        const question = await Question.findById(questionId).populate('userId', '-password');

        io.to(roomName).emit('new_question', {
          question,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error broadcasting question:', error);
      }
    });

    socket.on('question_upvote', (data) => {
      const { sessionId, questionId, upvotes } = data;
      const roomName = `qa-session_${sessionId}`;

      io.to(roomName).emit('question_upvoted', {
        questionId,
        upvotes,
        timestamp: new Date(),
      });
    });

    // User leaves
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initializeSocketHandlers };
