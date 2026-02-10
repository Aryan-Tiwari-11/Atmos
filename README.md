# 🎯 Atmos - Real-time Team Wellness Monitor

A modern MERN stack application for managing team wellness in real-time. Atmos provides managers with live insights into their team's mood, workload, and engagement through anonymous feedback, kudos recognition, and interactive Q&A sessions.

<img src="https://github.com/Aryan-Tiwari-11/Atmos/blob/main/client/public/team%20dashboard.png" alt="">
<img src="https://github.com/Aryan-Tiwari-11/Atmos/blob/main/client/public/kudos%20feed.png" alt="">
<img src="https://github.com/Aryan-Tiwari-11/Atmos/blob/main/client/public/pulse%20check.png" alt="">

## 📋 Features

### Core Features
- **Real-time Pulse Checks**: Anonymous mood/workload monitoring (Light, Good, Heavy)
- **Live Kudos Feed**: Team members recognize and appreciate each other
- **Manager Dashboard**: Real-time team wellness analytics with visual charts
- **Live Q&A Sessions**: Anonymous questions with upvoting during meetings
- **Role-Based Access**: Employee, Manager with appropriate permissions
- **Real-time Updates**: Socket.io powered live broadcasting of all events

## 🏗️ Project Structure

```
atmos/
├── server/                 # Express/Node.js backend
│   ├── src/
│   │   ├── models/        # MongoDB schemas (User, Team, Kudos, Pulse, Question)
│   │   ├── routes/        # API endpoints (auth, kudos, pulse, questions, teams)
│   │   ├── middleware/    # Authentication & authorization
│   │   ├── services/      # Socket.io event handlers
│   │   └── index.js       # Express app entry point
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
│
└── client/               # React frontend
    ├── src/
    │   ├── components/   # React components (KudosFeed, Dashboard, etc.)
    │   ├── pages/        # Page components (Login, Register, Dashboard)
    │   ├── services/     # API and Socket.io client services
    │   ├── styles/       # CSS files
    │   ├── App.js        # Root component
    │   └── index.js      # React entry point
    ├── public/           # Static files
    ├── .env              # Environment variables
    └── package.json      # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Edit `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/atmos
   JWT_SECRET=your_secure_secret
   NODE_ENV=develop
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   `.env` is already configured for local development:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_IO_URL=http://localhost:5000
   ```

4. **Start the React app**
   ```bash
   npm start
   ```

The app will open on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Kudos
- `POST /api/kudos/submit` - Submit a kudos (requires auth)
- `GET /api/kudos/team/:teamId` - Get team's kudos (requires auth)

### Pulse
- `POST /api/pulse/submit` - Submit pulse check (requires auth)
- `GET /api/pulse/team/:teamId/aggregated` - Get pulse aggregation (Manager/Admin only)

### Questions
- `POST /api/questions/submit` - Submit a question (requires auth)
- `POST /api/questions/:questionId/upvote` - Upvote a question (requires auth)
- `GET /api/questions/session/:sessionId` - Get session questions (requires auth)
- `POST /api/questions/:questionId/answer` - Answer question (Manager/Admin only)

### Teams
- `POST /api/teams/create` - Create team (Manager/Admin only)
- `GET /api/teams/:teamId` - Get team details (requires auth)
- `GET /api/teams/user/my-teams` - Get user's teams (requires auth)

## 🔌 Socket.io Events

### Client to Server
- `join_room` - User joins a room (e.g., company-feed, manager-dashboard)
- `new_kudos` - Broadcast new kudos
- `pulse_submitted` - Broadcast pulse check
- `new_question` - Broadcast new question
- `question_upvote` - Broadcast question upvote

### Server to Client
- `user_joined` - User joined room
- `new_kudos` - Live kudos feed update
- `pulse_update` - Live pulse data update
- `new_question` - Live question added
- `question_upvoted` - Question upvote count updated

## 🎨 UI Components

### Pages
- **Login** - User authentication
- **Register** - New account creation
- **Dashboard** - Main app hub with tabs for different features

### Components
- **KudosFeed** - Display and submit kudos
- **PulseModal** - Modal for mood/workload submission
- **ManagerDashboard** - Real-time team wellness chart
- **QAComponent** - Question submission and management
- **ProtectedRoute** - Route protection for authenticated users

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in browser localStorage
- Tokens are automatically added to all API requests
- Tokens expire after 7 days
- Token validation happens on both client and server

## 👥 User Roles

### Employee
- View company kudos feed
- Submit pulse checks
- Submit and upvote questions
- Can be anonymous

### Manager
- All employee features
- Create and manage teams
- View aggregated team pulse data
- View and answer Q&A questions

### Admin
- All features
- Full system access

## 📊 Real-time Features

### Kudos Feed
- New kudos appear instantly to all users in the team feed
- Live scrolling feed of appreciations
- Anonymous or named kudos

### Pulse Dashboard
- Managers see live team wellness percentage
- Updates as employees submit pulse checks
- Visualization with Chart.js doughnut chart

### Q&A Live Session
- Questions appear instantly with upvote counts
- Real-time upvote synchronization
- Manager can answer questions live

## 🛠️ Development

### Adding New Features

1. **Backend**
   - Create model in `server/src/models/`
   - Create routes in `server/src/routes/`
   - Add Socket.io handlers in `server/src/services/socketService.js`

2. **Frontend**
   - Create component in `client/src/components/`
   - Create page in `client/src/pages/` if needed
   - Add API methods to `client/src/services/api.js`
   - Add Socket.io listeners to `client/src/services/socketService.js`
   - Create styles in `client/src/styles/`

### Testing Locally

1. Create test accounts with different roles
2. Open multiple browser windows for simulating multiple users
3. Use browser dev tools to monitor Socket.io events
4. Check MongoDB for data persistence

## 📦 Dependencies

### Backend
- express: Web framework
- mongoose: MongoDB ODM
- socket.io: Real-time communication
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- cors: Cross-origin requests

### Frontend
- react: UI library
- react-router-dom: Routing
- socket.io-client: Socket.io client
- axios: HTTP client
- chart.js & react-chartjs-2: Charts
- react-scripts: Build tools

## 🚨 Security Considerations

1. **Change JWT_SECRET** in production
2. **Enable MongoDB authentication** in production
3. **Use HTTPS** in production
4. **Implement rate limiting** on endpoints
5. **Validate all user inputs** on server
6. **Use environment variables** for sensitive data
7. **Implement CSRF protection** if needed

## 🐛 Troubleshooting

### Socket.io Connection Issues
- Ensure server is running on correct port
- Check CORS settings in server
- Verify Socket.io URL in client .env

### MongoDB Connection Errors
- Ensure MongoDB is running
- Check connection string in .env
- Verify database name

### JWT Token Issues
- Clear localStorage and re-login
- Check token expiration in console
- Verify JWT_SECRET matches on server

## 📝 Future Enhancements

- [ ] Team member analytics
- [ ] Scheduled pulse checks
- [ ] Slack/Teams integration
- [ ] Email notifications
- [ ] Data export (CSV/PDF)
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Feedback comments
- [ ] Admin user management panel


Atmos Team - Real-time Wellness Monitoring
