const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger }
}, { _id: false });
const schema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  items: { type: [itemSchema], required: true, validate: { validator: v => v.length > 0, message: 'items must not be empty' } },
  borrowDate: { type: Date, default: Date.now, required: true },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  status: { type: String, enum: ['Borrowing', 'Returned', 'Overdue'], default: 'Borrowing' }
}, { timestamps: true });
schema.pre('validate', function () {
  if (this.dueDate <= this.borrowDate) this.invalidate('dueDate', 'dueDate must be after borrowDate');
});
module.exports = mongoose.model('Loan', schema);
