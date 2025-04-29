const mongoose = require('mongoose');

const activateStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('ActivateStatus', activateStatusSchema);
