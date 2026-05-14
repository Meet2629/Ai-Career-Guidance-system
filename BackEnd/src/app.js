const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Test result submission route
const testResultRoutes = require('./routes/testResult');
app.use('/api', testResultRoutes);

// AI Pathway (initial + follow-up) generation route
const aiPathwayRoutes = require('./routes/aiPathway.routes');
app.use('/api/ai-pathway', aiPathwayRoutes); // main route for AI roadmap

// Optional: if you're using a separate /ai/get-review or /ai/followup route
const aiRoutes = require('./routes/ai.routes');
app.use('/ai', aiRoutes); // fallback or additional AI-related endpoints

const aiRoutesResume = require('./routes/aiRoutesResume');

app.use('/api/resume-ai', aiRoutesResume);

// MongoDB connection
const connectDB = async () => { 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = { app, connectDB };
