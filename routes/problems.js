const express = require('express');
const router = express.Router();
const Problem = require('../models/problem');

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
    console.error('❌ Error saving problem:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get problems by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const problems = await Problem.find({ category }).sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Add a reply to a problem (with timestamp)
// Reply to a problem
router.post('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Push as object with timestamp
    problem.replies.push({ text: reply, createdAt: new Date() });
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit reply' });
  }
});


// DELETE a reply (only within 2 minutes of posting)
router.delete('/:id/reply/:index', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const index = parseInt(req.params.index);
    const reply = problem.replies[index];

    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    const now = Date.now();
    const replyTime = new Date(reply.createdAt).getTime();

    if (now - replyTime > 2 * 60 * 1000) {
      return res.status(403).json({ error: 'Reply can only be deleted within 2 minutes' });
    }

    problem.replies.splice(index, 1); // Remove the reply
    await problem.save();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

module.exports = router;
