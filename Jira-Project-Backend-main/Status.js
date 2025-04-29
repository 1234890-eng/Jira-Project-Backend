// models/Status.js
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Status', statusSchema);
