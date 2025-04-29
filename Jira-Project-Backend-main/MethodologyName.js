const mongoose = require('mongoose');

const methodologyNameSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MethodologyName', methodologyNameSchema);