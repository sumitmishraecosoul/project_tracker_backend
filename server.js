const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const WebSocketServer = require('./websocket/websocketServer');

dotenv.config();

// Set default environment variables if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-here-make-it-very-long-and-secure-for-production-use';
}
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://sumitmishrasm004:Ecosoul%40123@cluster0.jvgspc2.mongodb.net/asana_dev?retryWrites=true&w=majority';
}

const app = express();

// CORS Configuration for Production (Vercel)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://project-tracker-frontend-bunapfdxj-sumits-projects-6ae8f679.vercel.app',
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON format in request body',
        details: 'Please ensure your request body is valid JSON'
      }
    });
  }
  next(error);
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/user-tasks', require('./routes/userTasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Brand Management Routes
app.use('/api/brands', require('./routes/brands'));
app.use('/api/brands', require('./routes/brandUsers'));
app.use('/api/brands', require('./routes/brandProjects'));
app.use('/api/brands', require('./routes/categories'));
app.use('/api/brands', require('./routes/brandTasks'));
app.use('/api/brands', require('./routes/brandSubtasks'));
app.use('/api/brands', require('./routes/brandComments'));
app.use('/api/brands', require('./routes/brandActivities'));
app.use('/api/brands', require('./routes/brandNotifications'));
app.use('/api/brands', require('./routes/brandInvitations'));

// Advanced Comment System Routes
app.use('/api', require('./routes/advancedComments'));

// MongoDB Connection
const port = process.env.PORT || 5000;

// Use MONGODB_URI (Vercel standard) or fallback to MONGO_URI
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// For Vercel serverless functions, we need to export the app
// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const server = http.createServer(app);
  
  // Initialize WebSocket server only for local development
  const wsServer = new WebSocketServer(server);
  
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`WebSocket server available at ws://localhost:${port}/api/ws`);
  });
}

// Export the app for Vercel
module.exports = app;
