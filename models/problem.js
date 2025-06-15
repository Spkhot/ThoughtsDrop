const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  replies: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Problem', problemSchema);
