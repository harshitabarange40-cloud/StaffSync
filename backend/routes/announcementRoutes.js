const express = require('express');
const Announcement = require('../models/Announcement');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Sabhi logged-in users announcements dekh sakte hain
router.get('/', authMiddleware, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sirf Admin/HR announcement post kar sakte hain
router.post('/', authMiddleware, roleMiddleware('Admin', 'HR'), async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: 'Title and message are required'
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      postedBy: req.user?.name || req.user?.email || 'HR'
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;