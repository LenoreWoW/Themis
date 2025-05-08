// Simple API proxy for Netlify functions
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Themis API proxy is running'
  });
});

// Demo endpoint for testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    isNetlify: true
  });
});

// Handle SPA fallback - for any routes that don't match an API endpoint
app.use('*', (req, res) => {
  res.json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Export the serverless function
module.exports.handler = serverless(app); 