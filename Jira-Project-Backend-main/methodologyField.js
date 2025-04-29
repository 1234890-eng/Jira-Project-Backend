const mongoose = require('mongoose');

const methodologyFieldSchema = new mongoose.Schema({
  methodologyNameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MethodologyName',
    required: true
  },
  boardName: {
    type: String, // Assuming 'boardName' is a string
    required: true
  },
  taskTitle: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  status: { type: String, enum: ['completed', 'not completed'], required: true },
  wipLimit: { type: Number, required: true },
  issueType: { type: String, enum: ['severe', 'low'], required: true },
  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MethodologyField', methodologyFieldSchema);
