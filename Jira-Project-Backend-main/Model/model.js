const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },   // example: SuperAdmin003
  email: { type: String, required: true, trim: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'Manager', 'User'],
    default: 'User',
    required: true
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const UserCreation = mongoose.model('UserCreation', userSchema);

module.exports = UserCreation;
