// Simple API server for GradeFlow development
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the lesson plan API handler
const lessonPlanHandler = require('./api/lesson-plan.js').default;

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/lesson-plan', async (req, res) => {
  try {
    await lessonPlanHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`GradeFlow API server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
