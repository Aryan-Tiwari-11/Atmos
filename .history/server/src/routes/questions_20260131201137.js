const express = require('express');
const { auth, authorizeRole } = require('../middleware/auth');
const Question = require('../models/Question');

const router = express.Router();

// Submit a question
router.post('/submit', auth, async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    const userId = req.userId;
    let teamId = req.teamId;

    if (!sessionId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // If user doesn't have a teamId, find their primary team
    if (!teamId) {
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user && user.teamId) {
        teamId = user.teamId;
      } else {
        return res.status(400).json({ message: 'User must be assigned to a team' });
      }
    }

    const question = new Question({
      sessionId,
      teamId,
      userId,
      content,
    });

    await question.save();
    await question.populate('userId', '-password');

    res.status(201).json(question);
  } catch (error) {
    console.error('Question submit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upvote a question
router.post('/:questionId/upvote', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.userId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const alreadyUpvoted = question.upvoterIds.includes(userId);
    if (alreadyUpvoted) {
      // Remove upvote
      question.upvoterIds = question.upvoterIds.filter((id) => !id.equals(userId));
      question.upvotes--;
    } else {
      // Add upvote
      question.upvoterIds.push(userId);
      question.upvotes++;
    }

    await question.save();
    await question.populate('userId', '-password');

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all questions for a session
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const questions = await Question.find({ sessionId })
      .populate('userId', '-password')
      .sort({ upvotes: -1, createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Answer a question (Manager/Admin only)
router.post('/:questionId/answer', auth, authorizeRole('Manager', 'Admin'), async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { isAnswered: true, answer },
      { new: true }
    ).populate('userId', '-password');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
