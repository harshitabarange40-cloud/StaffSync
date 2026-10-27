const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  trainer: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'All'
  },
  date: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Training', trainingSchema);