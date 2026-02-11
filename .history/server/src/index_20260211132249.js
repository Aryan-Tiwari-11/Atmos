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

// CORS Configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'https://atmos-client-three.vercel.app',
      'https://atmos-client.vercel.app',
    ];
    
    // Also allow any origin from Vercel deployments
    if (origin.includes('https://') && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = socketio(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
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
