/**
 * Test server script
 * 
 * This script starts the server for testing the RAG implementation.
 * Run this script with: node run-test-server.js
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const aiAssistantRoutes = require('./routes/aiAssistant');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiAssistantRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Test the server at http://localhost:${PORT}/api/test`);
      console.log(`Test the AI assistant at http://localhost:${PORT}/api/ai/chat`);
      console.log(`Test the build generator at http://localhost:${PORT}/api/ai/generate-build`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 