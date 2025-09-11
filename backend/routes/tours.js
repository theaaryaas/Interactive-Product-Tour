const express = require('express');
const { body, validationResult } = require('express-validator');
const Tour = require('../models/Tour');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tours
// @desc    Get all public tours or user's tours
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, public = false } = req.query;
    
    let query = {};
    if (public === 'true') {
      query = { isPublic: true, isPublished: true };
    } else {
      query = { author: req.user._id };
    }

    const tours = await Tour.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tour.countDocuments(query);

    res.json({
      tours,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tours/:id
// @desc    Get single tour
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('author', 'name email');
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user can access this tour
    if (!tour.isPublic && tour.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tours
// @desc    Create new tour
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').optional().trim(),
  body('steps').isArray().withMessage('Steps must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, steps, tags, isPublic } = req.body;

    const tour = new Tour({
      title,
      description,
      steps,
      tags: tags || [],
      isPublic: isPublic || false,
      author: req.user._id
    });

    await tour.save();
    await tour.populate('author', 'name email');

    res.status(201).json(tour);
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tours/:id
// @desc    Update tour
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('steps').optional().isArray().withMessage('Steps must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user owns this tour
    if (tour.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, steps, tags, isPublic, isPublished } = req.body;

    if (title) tour.title = title;
    if (description !== undefined) tour.description = description;
    if (steps) tour.steps = steps;
    if (tags) tour.tags = tags;
    if (isPublic !== undefined) tour.isPublic = isPublic;
    if (isPublished !== undefined) tour.isPublished = isPublished;

    await tour.save();
    await tour.populate('author', 'name email');

    res.json(tour);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tours/:id
// @desc    Delete tour
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if user owns this tour
    if (tour.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Tour.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tours/public/:shareUrl
// @desc    Get public tour by share URL
// @access  Public
router.get('/public/:shareUrl', async (req, res) => {
  try {
    const tour = await Tour.findOne({ 
      shareUrl: req.params.shareUrl,
      isPublic: true,
      isPublished: true
    }).populate('author', 'name email');
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Increment view count
    tour.views += 1;
    await tour.save();

    res.json(tour);
  } catch (error) {
    console.error('Get public tour error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

