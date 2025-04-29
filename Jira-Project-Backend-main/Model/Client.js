const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
  },
  organizationType: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true,
  },
  createdByRole: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
