const mongoose = require('mongoose');
const copies = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  isbn: { type: String, required: true, unique: true, trim: true },
  publishedYear: { type: Number, validate: Number.isSafeInteger },
  totalCopies: copies,
  availableCopies: copies
}, { timestamps: true, optimisticConcurrency: true });
schema.pre('validate', function () {
  if (this.availableCopies > this.totalCopies) this.invalidate('availableCopies', 'availableCopies cannot exceed totalCopies');
});
module.exports = mongoose.model('Book', schema);
