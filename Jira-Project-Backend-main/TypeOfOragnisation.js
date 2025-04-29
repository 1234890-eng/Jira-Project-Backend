const mongoose = require('mongoose');

const typeOfOrganisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('TypeOfOrganisation', typeOfOrganisationSchema);
