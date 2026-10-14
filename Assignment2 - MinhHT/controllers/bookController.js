const Book = require('../models/Book');
const Loan = require('../models/Loan');
const { fail, validId, bodyFields } = require('./validation');
const fields = ["title","author","category","isbn","publishedYear","totalCopies","availableCopies"];

exports.list = async (req, res) => res.json(await Book.find());

exports.get = async (req, res) => {
  validId(req.params.id);
  const record = await Book.findById(req.params.id);
  if (!record) fail(404, 'Book not found');
  res.json(record);
};

exports.create = async (req, res) => {
  const record = await Book.create(bodyFields(req.body, fields));
  res.status(201).json(record);
};

exports.update = async (req, res) => {
  validId(req.params.id);
  const input = bodyFields(req.body, fields);
  const record = await Book.findById(req.params.id);
  if (!record) fail(404, 'Book not found');
  if ('totalCopies' in input || 'availableCopies' in input) {
    const borrowed = record.totalCopies - record.availableCopies;
    const total = input.totalCopies ?? record.totalCopies;
    const available = input.availableCopies ?? (total - borrowed);
    if (total - available !== borrowed) fail(409, 'Inventory changes must preserve borrowed copies');
    input.availableCopies = available;
  }
  record.set(input);
  await record.save();
  res.json(record);
};

exports.remove = async (req, res) => {
  validId(req.params.id);
  const record = await Book.findById(req.params.id);
  if (!record) fail(404, 'Book not found');
  if (await Loan.exists({ 'items.book_id': record._id })) fail(409, 'Cannot delete a record referenced by a loan');
  await record.deleteOne();
  res.status(204).end();
};
