require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));


// ROUTES (backend logic)
// Example:
const Problem = require('./models/problem'); // make sure this exists

app.get('/problems/:category', async (req, res) => {
  try {
    const problems = await Problem.find({ category: req.params.category });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/ask', async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const newProblem = new Problem({ title, description, category, replies: [] });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit problem' });
  }
});

app.post('/api/problems', async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const newProblem = new Problem({ title, description, category, replies: [] });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit problem' });
  }
});


// Fallback for SPA routing (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
