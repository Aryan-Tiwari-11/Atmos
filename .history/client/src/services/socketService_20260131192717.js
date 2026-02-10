import io from 'socket.io-client';

const SOCKET_IO_URL = process.env.REACT_APP_SOCKET_IO_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (token, userId) => {
  socket = io(SOCKET_IO_URL, {
    auth: {
      token,
      userId,
    },
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const joinRoom = (userId, teamId, roomType) => {
  if (socket) {
    socket.emit('join_room', { userId, teamId, roomType });
  }
};

export const subscribeToKudos = (callback) => {
  if (socket) {
    socket.on('new_kudos', callback);
  }
};

export const subscribeToPulseUpdate = (callback) => {
  if (socket) {
    socket.on('pulse_update', callback);
  }
};

export const subscribeToNewQuestion = (callback) => {
  if (socket) {
    socket.on('new_question', callback);
  }
};

export const subscribeToQuestionUpvote = (callback) => {
  if (socket) {
    socket.on('question_upvoted', callback);
  }
};

export const emitNewKudos = (teamId, kudosId) => {
  if (socket) {
    socket.emit('new_kudos', { teamId, kudosId });
  }
};

export const emitPulseSubmitted = (teamId, status) => {
  if (socket) {
    socket.emit('pulse_submitted', { teamId, status });
  }
};

export const emitNewQuestion = (sessionId, teamId, questionId) => {
  if (socket) {
    socket.emit('new_question', { sessionId, teamId, questionId });
  }
};

export const emitQuestionUpvote = (sessionId, questionId, upvotes) => {
  if (socket) {
    socket.emit('question_upvote', { sessionId, questionId, upvotes });
  }
};
