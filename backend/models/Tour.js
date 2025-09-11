const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['highlight', 'text', 'arrow', 'circle'],
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    default: 0
  },
  height: {
    type: Number,
    default: 0
  },
  text: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3b82f6'
  }
});

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  video: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'both'],
    default: 'image'
  },
  annotations: [annotationSchema],
  order: {
    type: Number,
    required: true
  }
});

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: null
  },
  steps: [stepSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shareUrl: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate share URL before saving
tourSchema.pre('save', function(next) {
  if (this.isPublished && !this.shareUrl) {
    this.shareUrl = `tour-${this._id.toString().slice(-8)}`;
  }
  next();
});

module.exports = mongoose.model('Tour', tourSchema);

