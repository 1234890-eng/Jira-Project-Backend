const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  issueName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('IssueA', IssueSchema);
