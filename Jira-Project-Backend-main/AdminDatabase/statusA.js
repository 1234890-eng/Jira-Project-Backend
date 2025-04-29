const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  statusName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('statusA', StatusSchema);
