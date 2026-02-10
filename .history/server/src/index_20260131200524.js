require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const { initializeSocketHandlers } = require('./services/socketService');

const authRoutes = require('./routes/auth');
const kudosRoutes = require('./routes/kudos');
const pulseRoutes = require('./routes/pulse');
const questionRoutes = require('./routes/questions');
const teamRoutes = require('./routes/teams');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kudos', kudosRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/teams', teamRoutes);

// Socket.io handlers
initializeSocketHandlers(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
