const express = require('express');
const Training = require('../models/Training');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Logged-in users training dekh sakte hain
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sirf Manager training add kar sakta hai
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Admin', 'Manager'),
  async (req, res) => {
    try {
      const { title, description, trainer, department, date } = req.body;

      if (!title || !description || !trainer || !date) {
        return res.status(400).json({
          message: 'Title, description, trainer and date are required'
        });
      }

      const training = await Training.create({
        title,
        description,
        trainer,
        department: department || 'All',
        date,
        createdBy: req.user?.name || req.user?.email || 'Manager'
      });

      res.status(201).json(training);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;