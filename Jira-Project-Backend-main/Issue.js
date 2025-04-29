const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Issue', IssueSchema);
