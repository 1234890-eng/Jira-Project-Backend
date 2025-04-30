const mongoose = require('mongoose');

const typeOfOrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCreation',
    required: true
  },
  createdByRole: {
    type: String,
    enum: ['Admin', 'SuperAdmin'],
    required: true
  }
});

module.exports = mongoose.model('TypeOfOrganization', typeOfOrganizationSchema);
