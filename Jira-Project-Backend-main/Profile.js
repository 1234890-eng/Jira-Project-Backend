const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  image: {
    type: String // Will store file path or filename
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('Profile', profileSchema);
