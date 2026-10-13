const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, required: true, trim: true },
  membershipType: { type: String, required: true, enum: ['Student', 'Teacher', 'Guest'] },
  isActive: { type: Boolean, default: true, required: true }
}, { timestamps: true, optimisticConcurrency: true });
module.exports = mongoose.model('Member', schema);
