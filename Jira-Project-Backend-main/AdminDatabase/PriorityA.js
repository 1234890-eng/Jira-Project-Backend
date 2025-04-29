const mongoose = require('mongoose');

const PrioritySchema = new mongoose.Schema({
  priorityName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PriorityA', PrioritySchema);
