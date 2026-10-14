const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');
const { fail, validId, bodyFields } = require('./validation');
const populated = query => query.populate('member_id', 'fullName email membershipType isActive').populate('items.book_id', 'title author isbn');
exports.list = async (req, res) => res.json(await populated(Loan.find()));
exports.byMember = async (req, res) => {
  validId(req.params.memberID);
  if (!await Member.exists({ _id: req.params.memberID })) fail(404, 'Member not found');
  res.json(await populated(Loan.find({ member_id: req.params.memberID })));
};
exports.borrow = async (req, res) => {
  const input = bodyFields(req.body, ['member_id', 'items', 'borrowDate', 'dueDate']);
  validId(input.member_id);
  if (!Array.isArray(input.items) || !input.items.length) fail(400, 'items must be a non-empty array');
  const quantities = new Map();
  for (const item of input.items) {
    bodyFields(item, ['book_id', 'quantity']);
    validId(item.book_id);
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) fail(400, 'quantity must be a positive integer');
    const id = item.book_id.toLowerCase();
    const quantity = (quantities.get(id) || 0) + item.quantity;
    if (!Number.isSafeInteger(quantity)) fail(400, 'quantity is too large');
    quantities.set(id, quantity);
  }
  const data = { ...input, items: [...quantities].map(([book_id, quantity]) => ({ book_id, quantity })) };
  await new Loan(data).validate();
  const member = await Member.findById(input.member_id);
  if (!member) fail(404, 'Member not found');
  if (!member.isActive) fail(409, 'Inactive members cannot borrow');
  // Validate every book before changing any stock.
  for (const item of data.items) {
    const book = await Book.findById(item.book_id);
    if (!book) fail(404, 'Book not found: ' + item.book_id);
    if (book.availableCopies < item.quantity) fail(409, 'Insufficient available copies: ' + book.title);
  }
  const changed = [];
  let loan;
  try {
    for (const item of data.items) {
      const result = await Book.updateOne({ _id: item.book_id, availableCopies: { $gte: item.quantity } },
        { $inc: { availableCopies: -item.quantity, __v: 1 } });
      if (!result.modifiedCount) fail(409, 'Insufficient available copies');
      changed.push(item);
    }
    loan = await Loan.create(data);
  } catch (error) {
    await undoStock(changed, 1);
    throw error;
  }
  res.status(201).json(await populated(Loan.findById(loan._id)));
};

exports.returnLoan = async (req, res) => {
  validId(req.params.id);
  if (req.body) bodyFields(req.body, []);
  const loan = await Loan.findById(req.params.id);
  if (!loan) fail(404, 'Loan not found');
  if (loan.status === 'Returned') fail(409, 'Loan already returned');
  for (const item of loan.items) {
    const book = await Book.findById(item.book_id);
    if (!book || book.availableCopies + item.quantity > book.totalCopies) {
      fail(409, 'Book missing or inventory inconsistent; return cancelled');
    }
  }
  const changed = [];
  try {
    for (const item of loan.items) {
      const result = await Book.updateOne({ _id: item.book_id,
        $expr: { $lte: [{ $add: ['$availableCopies', item.quantity] }, '$totalCopies'] } },
        { $inc: { availableCopies: item.quantity, __v: 1 } });
      if (!result.modifiedCount) fail(409, 'Inventory changed; return cancelled');
      changed.push(item);
    }
    loan.status = 'Returned';
    loan.returnDate = new Date();
    await loan.save();
  } catch (error) {
    await undoStock(changed, -1);
    throw error;
  }
  res.json(await populated(Loan.findById(loan._id)));
};

// Compensate completed stock updates when a later operation fails.
// Standalone MongoDB cannot guarantee rollback after a crash or network failure.
async function undoStock(items, direction) {
  for (const item of items.reverse()) {
    const result = await Book.updateOne({ _id: item.book_id },
      { $inc: { availableCopies: direction * item.quantity, __v: 1 } });
    if (!result.modifiedCount) fail(503, 'Could not restore inventory; manual reconciliation is required');
  }
}
