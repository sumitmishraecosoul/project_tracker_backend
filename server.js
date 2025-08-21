const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/user-tasks', require('./routes/userTasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// MongoDB Connection
const port = process.env.PORT || 5000;

// Check for required environment variables
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  console.error('MONGODB_URI or MONGO_URI not set. Please configure your environment variables');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET not set. Please configure your environment variables');
  process.exit(1);
}

// Use MONGODB_URI (Vercel standard) or fallback to MONGO_URI
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
