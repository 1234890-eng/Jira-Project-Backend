const mongoose = require('mongoose');

const OrganisationTypeSchema = new mongoose.Schema({
  organisationName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OrganisationTypeA', OrganisationTypeSchema);
