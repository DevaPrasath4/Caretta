// server/app.js – Express app
const express = require('express');
const path = require('path');
const cors    = require('cors');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes       = require('./routes/authRoutes');
const callRoutes       = require('./routes/callRoutes');
const transcriptRoutes = require('./routes/transcriptRoutes');
const aiRoutes         = require('./routes/aiRoutes');
const kbRoutes         = require('./routes/kbRoutes');
require('dotenv').config();
connectDB();

const app = express();

// Serve static client files and use landing.html as the default index
app.use(express.static(path.join(__dirname, '../../client'), { index: 'landing.html' }));

// Permissive CORS for development
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow all localhost variants for development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      process.env.CLIENT_URL || 'http://localhost:3000'
    ].filter(Boolean);
    
    // In development, allow all localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/calls',       callRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/kb', kbRoutes);
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Caretta W26' }));

// Serve landing.html for all other routes (make landing the default entry)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/landing.html'));
});

app.use(errorHandler);

module.exports = app;