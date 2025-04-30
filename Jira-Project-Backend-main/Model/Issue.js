const mongoose = require('mongoose');
const issueSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    createdByUserId: {
      type: String,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ['Admin', 'SuperAdmin'],
      required: true,
    }
  });
  