const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const { setupSocketHandlers } = require('./socket/socketHandlers');
const authController = require('./controllers/authController');

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - ADD THESE ROUTES
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chat Server API is running!',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chat server is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Socket.io setup
setupSocketHandlers(io);

// Use Render's port
const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});