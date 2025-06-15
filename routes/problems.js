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

// Submit a reply to a problem
router.post('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const replyObj = {
      text: reply,
      createdAt: new Date()
    };

    problem.replies.push(replyObj);
    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit reply' });
  }
});

// Delete a reply (only within 2 minutes of its creation)
router.post('/:id/delete-reply', async (req, res) => {
  try {
    const { replyIndex } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const reply = problem.replies[replyIndex];
    if (!reply) return res.status(400).json({ error: 'Invalid reply index' });

    const now = new Date();
    const createdAt = new Date(reply.createdAt);
    const timeDiffMs = now - createdAt;

    if (timeDiffMs > 2 * 60 * 1000) {
      return res.status(403).json({ error: 'Reply can only be deleted within 2 minutes' });
    }

    // Remove reply
    problem.replies.splice(replyIndex, 1);
    await problem.save();

    res.json({ success: true, message: 'Reply deleted' });
  } catch (err) {
    console.error('❌ Error deleting reply:', err);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

module.exports = router;
