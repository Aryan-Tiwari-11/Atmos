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

// Dynamic CORS origins for local and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.CLIENT_URL || '',
].filter(Boolean);

const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
