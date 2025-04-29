const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  createdBy: { type: String, ref: 'UserCreation' }, // Link to creator
  createdByRole: { type: String, enum: ['SuperAdmin', 'Admin'], required: true }
});

module.exports = mongoose.model('Role', roleSchema);
