// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'team lead'],
    required: true,
  },
  projectId: {
    type: Number,
    enum: [1, 2, 3],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
