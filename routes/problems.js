const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// Submit a new problem
// Submit a new problem
router.post('/', async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const newProblem = new Problem({ title, description, category });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all problems by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const problems = await Problem.find({ category }).sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Submit a reply to a problem
router.post('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    problem.replies.push(reply);
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit reply' });
  }
});

module.exports = router;
