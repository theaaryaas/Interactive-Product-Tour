const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Tour = require('../models/Tour');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const tours = await Tour.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalTours = await Tour.countDocuments({ author: req.user._id });
    const publishedTours = await Tour.countDocuments({ 
      author: req.user._id, 
      isPublished: true 
    });
    const totalViews = await Tour.aggregate([
      { $match: { author: req.user._id } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    res.json({
      recentTours: tours,
      stats: {
        totalTours,
        publishedTours,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

